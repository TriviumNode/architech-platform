import { Router } from 'express';
import { CreateUserDto } from '@architech/types';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {
  editCollection,
  getAllCollections,
  getCollectionByAddress,
  getTrendingCollections,
  importCollection,
  importCollectionAdmin,
  refreshCollection,
  searchCollections,
} from '@/controllers/collections.controller';
import authMiddleware, { optionalAuthMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/utils/storage';
import fileUploadMiddleware from '@/middlewares/fileUploadMiddleware';

class CollectionsRoute implements Routes {
  public path = '/collections';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all collections
    // TODO: Pagination and Sorting
    // Note: Sort middleware?
    this.router.get(`${this.path}`, getAllCollections);

    this.router.get(`${this.path}/search`, searchCollections);

    // Get top viewed collections
    this.router.get(`${this.path}/trending`, getTrendingCollections);

    // Get collection details
    // Authentication not required, only used to store view history
    this.router.get(`${this.path}/:contractAddr`, optionalAuthMiddleware, getCollectionByAddress);

    // Import collection
    // TODO: Require authentication. Only allow owner to import.
    this.router.post(
      `${this.path}/import/:contractAddr`,
      upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ]),
      fileUploadMiddleware,
      importCollection,
    );
    this.router.get(`${this.path}/adminimport/:contractAddr`, importCollectionAdmin);
    this.router.post(`${this.path}/adminimport/:contractAddr`, importCollectionAdmin);

    // Refresh collection
    // TODO: Require authentication?
    this.router.get(`${this.path}/refresh/:contractAddr`, refreshCollection);
    this.router.post(`${this.path}/refresh/:contractAddr`, refreshCollection);

    // Edit Collection Profile
    this.router.post(
      `${this.path}/edit/:id`,
      upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ]),
      authMiddleware,
      fileUploadMiddleware,
      editCollection,
    );
  }
}

export default CollectionsRoute;
