import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import proxy from 'express-http-proxy';

class IpfsRoute implements Routes {
  public path = '/ipfs';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(
      `${this.path}/jackal`,
      proxy(`${process.env.JACKAL_API_URL}/ipfs/`, {
        proxyReqPathResolver: function (req) {
          const newPath = `/ipfs${req.url}`;
          return newPath;
        },
      }),
    );

    this.router.use(
      `${this.path}/proxy`,
      proxy(`${process.env.IPFS_GATEWAY}/ipfs/`, {
        proxyReqPathResolver: function (req) {
          const newPath = `/ipfs${req.url}`;
          return newPath;
        },
        userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
          headers['cross-origin-resource-policy'] = 'cross-origin';
          return headers;
        },
      }),
    );
  }
}

export default IpfsRoute;
