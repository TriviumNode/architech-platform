import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { upload, upload5mb, uploadBatch } from '@/utils/storage';
import { uploadImage, uploadImageBatch } from '@/controllers/upload.controller';

class UploadRoute implements Routes {
  public path = '/upload';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/batch`, authMiddleware, uploadBatch.fields([{ name: 'images', maxCount: 500 }]), uploadImageBatch);
    this.router.post(`${this.path}`, authMiddleware, upload5mb.single('image'), uploadImage);
  }
}

export default UploadRoute;
