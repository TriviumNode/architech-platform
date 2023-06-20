import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import CollectionsRoute from './routes/collections.route';
import TokensRoute from './routes/tokens.route';
import UploadRoute from './routes/upload.route';
import { initClients } from './utils/chainClients';

const main = async () => {
  await initClients();

  validateEnv();

  const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new CollectionsRoute(), new TokensRoute(), new UploadRoute()]);

  app.listen();
};

main();
