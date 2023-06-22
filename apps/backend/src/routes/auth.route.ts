import { Router } from 'express';
import * as authController from '@controllers/auth.controller';
import { CreateUserDto, NonceRequestDto, WalletLoginDto } from '@architech/types';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import * as usersController from '@controllers/users.controller';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Fetch login nonce from database.
    // User will be created and a random nonce generated if they are not in the database.
    this.router.get(`${this.path}/check/:userAddress`, authMiddleware, authController.checkLogin);

    // Fetch login nonce from database.
    // User will be created and a random nonce generated if they are not in the database.
    this.router.post(`${this.path}/nonce`, validationMiddleware(NonceRequestDto, 'body'), usersController.getNonce);

    // Handle login with wallet.
    // Validated signed message with nonce.
    // Issues JWT cookie on success.
    this.router.post(`${this.path}/wallet`, validationMiddleware(WalletLoginDto, 'body'), authController.walletLogin);

    // Clear Cookie
    this.router.post(`${this.path}/logout`, authMiddleware, authController.logOut);
  }
}

export default AuthRoute;
