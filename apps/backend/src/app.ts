import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, RPC_URL } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';

import proxy from 'express-http-proxy';
import bodyParser from 'body-parser';
import NodeCache from 'node-cache';
import { RawData, WebSocket } from 'ws';
import { ensureMultiple, ensureToken } from './services/tokens.service';
import { refreshCollection } from './services/collections.service';

export const cache = new NodeCache({ stdTTL: 15 });

const WS_URL = `${RPC_URL.replace(/\/$/, '').replace('https', 'wss').replace('http', 'ws')}/websocket`;

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  // Tendermint RPC Websocket connection
  public ws: WebSocket;
  // Websocket Timeout to detect dead connection
  public wsTimeout: any;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.ws = new WebSocket(WS_URL);

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    // Subscribe to mint events when websocket connects
    // Will re-run when websocket is re-created
    this.ws.on('open', function open() {
      console.log('New Websocket Opened.');
      const subscribeMint = {
        jsonrpc: '2.0',
        method: 'subscribe',
        id: 0,
        params: {
          query: "wasm.architech_action='mint'",
          // query: "tm.event='NewBlock'",
        },
      };
      this.send(JSON.stringify(subscribeMint));

      const subscribeEdit = {
        jsonrpc: '2.0',
        method: 'subscribe',
        id: 1,
        params: {
          query: "wasm.architech_action='edit_minter'",
        },
      };
      this.send(JSON.stringify(subscribeEdit));
      console.log('WS Subscribed.');
    });

    // Log websocket errors
    this.ws.on('error', console.error);
    // Resets websocket timeout. Server regularly sends pings.
    this.ws.on('ping', this.handleWsHeartbeat);
    // Creates new websocket when websocket closes.
    this.ws.on('close', this.handleWsClose);
    // Handle Websocket messages
    this.ws.on('message', this.handleWsMessage);
  }

  public handleWsHeartbeat(data: Buffer) {
    clearTimeout(this.wsTimeout);

    // `WebSocket#terminate()` immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.wsTimeout = setTimeout(() => {
      console.log('Websocket expired.');
      this.ws.terminate();
    }, 30000 + 1000);
  }

  public handleWsClose(data: number) {
    console.log('Websocket closed.');
    this.ws = new WebSocket(WS_URL);
  }

  public handleWsMessage(data: RawData, isBinary: boolean) {
    if (isBinary) {
      console.log('WS returned binary data???:', data);
      return;
    }

    const object = JSON.parse(data.toString());
    if (typeof object !== 'object') {
      console.log('WS returned unknown data:', object);
      return;
    }

    if (Object.keys(object.result).length) {
      console.log('WS Message!', object);
      switch (object.result.query) {
        case `wasm.architech_action='mint'`: {
          // Handle Mint
          const recipient: string = object.result.events['wasm.recipient'][0];
          const collectionAddress: string = object.result.events['wasm.collection'][0];
          const mintedTokenIds: string[] = object.result.events['wasm.token_id'];
          const architechApp: string = object.result.events['wasm.architech_app'][0];

          for (const mintedTokenId of mintedTokenIds) {
            console.log(`Token ID ${mintedTokenId} minted for ${recipient} on collection ${collectionAddress} using app ${architechApp}!`);
          }
          ensureMultiple(collectionAddress, mintedTokenIds);

          break;
        }
        case `wasm.architech_action='edit_minter'`: {
          // Handle Edit Minter
          const collectionAddress: string = object.result.events['wasm.collection'][0];
          const minterAddress: string = object.result.events['wasm.minter'][0];
          const architechApp: string = object.result.events['wasm.architech_app'][0];
          console.log(`${architechApp} ${minterAddress} for collection ${collectionAddress} was edited!`);
          refreshCollection(collectionAddress);
          break;
        }
        case `wasm.architech_app='marketplace'`: {
          // Handle Marketplace Buy/List/Cancel
          const collectionAddress: string = object.result.events['wasm.collection'][0];
          const tokenId: string = object.result.events['wasm.token_id'][0];
          const action: string = object.result.events['wasm.architech_action'][0];

          console.log(`Token ID ${tokenId} from collection ${collectionAddress} was ${action} on the marketplace!`);
          ensureToken(collectionAddress, tokenId);

          break;
        }
        case `wasm.action='transfer_nft'`: {
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          console.log('AAAAAAAAAAAA');
          // Handle NFT Transfer
          // const collectionAddress: string = object.result.events['wasm.collection'][0];
          const tokenId: string = object.result.events['wasm.token_id'][0];
          const recipient: string = object.result.events['wasm.recipient'][0];
          const sender: string = object.result.events['wasm.sender'][0];

          console.log(JSON.stringify(object, undefined, 2));

          console.log(`Token ID ${tokenId} from collection ${undefined} was transfered from ${sender} to ${recipient}!`);
          // ensureToken(collectionAddress, tokenId);

          break;
        }
      }
    }
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection);
  }

  private initializeMiddlewares() {
    // this.app.use(morgan(LOG_FORMAT, { stream }));
    // this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(cors({ credentials: true, origin: true }));
    this.app.options('*', cors({ credentials: true, origin: true }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(cookieParser());

    this.app.use(
      '/public',
      express.static('uploads', {
        setHeaders: function (res, path) {
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
          res.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
          // res.type('application/json');
          // res.type('jpg');
          res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
          res.set('Cross-Origin-Opener-Policy', 'unsafe-none');
          res.set('Cross-Origin-Resource-Policy', 'same-site');
        },
      }),
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    // const specs = swaggerJSDoc(options);
    // this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
