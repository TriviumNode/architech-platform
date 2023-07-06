import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import AdminRoute from './routes/admin.route';
import CollectionsRoute from './routes/collections.route';
import TokensRoute from './routes/tokens.route';
import UploadRoute from './routes/upload.route';
import { initClients } from './utils/chainClients';

const main = async () => {
  await initClients().catch(e => console.error('FAILED TO INIT QUERY CLIENT', e));

  validateEnv();

  const app = new App([
    new IndexRoute(),
    new UsersRoute(),
    new AuthRoute(),
    new CollectionsRoute(),
    new TokensRoute(),
    new UploadRoute(),
    new AdminRoute(),
  ]);

  app.listen();
};

main();
