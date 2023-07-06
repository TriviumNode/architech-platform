import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { refreshCollection } from '@/controllers/collections.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import { purgeCollection, purgeTokens } from '@/controllers/admin.controller';

class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Delete Collection and Tokens from DB
    // Requires admin authentication
    this.router.post(`${this.path}/purge_collection/:contractAddr`, authMiddleware, purgeCollection);

    // Delete Collection Tokens from DB
    // Requires admin authentication
    this.router.post(`${this.path}/purge_tokens/:contractAddr`, authMiddleware, purgeTokens);
  }
}

export default AdminRoute;
