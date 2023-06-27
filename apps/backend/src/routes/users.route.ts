import { Router } from 'express';
import * as usersController from '@controllers/users.controller';
import { CreateUserDto, NonceRequestDto, UpdateUserDto } from '@architech/types';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import { upload } from '@/utils/storage';
import fileUploadMiddleware from '@/middlewares/fileUploadMiddleware';
import { getFavorites } from '@/controllers/favorites.controller';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get public user profile
    this.router.get(`${this.path}/address/:address`, usersController.getUserByAddress);

    // Get public user profile
    this.router.get(`${this.path}/favorites/:address`, getFavorites);

    // Update user profile
    // Requires authentication
    //TODO verify same user
    this.router.post(`${this.path}/profile/:id`, authMiddleware, validationMiddleware(UpdateUserDto, 'body', true), usersController.updateUser);

    // Update user profile
    // Requires authentication
    //TODO verify same user
    this.router.post(`${this.path}/image/:id`, upload.single('file'), authMiddleware, usersController.updateUserImage);

    // Edit User Profile
    this.router.post(
      `${this.path}/edit/:id`,
      upload.fields([{ name: 'profile', maxCount: 1 }]),
      authMiddleware,
      fileUploadMiddleware,
      usersController.editUser,
    );

    // Get user profile by ID
    // Requires authentication
    // Really only used to check if the user is already logged in
    this.router.get(`${this.path}/:id`, authMiddleware, usersController.getUserById);
  }
}

export default UsersRoute;
