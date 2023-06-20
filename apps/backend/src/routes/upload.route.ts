import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { upload } from '@/utils/storage';
import { uploadImage } from '@/controllers/upload.controller';

class UploadRoute implements Routes {
  public path = '/upload';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Edit User Profile
    this.router.post(`${this.path}`, upload.single('image'), authMiddleware, uploadImage);
  }
}

export default UploadRoute;
