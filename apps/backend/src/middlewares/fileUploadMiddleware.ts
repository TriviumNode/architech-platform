import { RequestWithUser, DataStoredInToken } from '@/../../../packages/architech-types/dist';
import { SECRET_KEY } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { Response, NextFunction, Request } from 'express';
import { verify } from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import { Multer } from 'multer';
import path from 'path';

export interface RequestWithImages extends RequestWithUser {
  images?: {
    profile?: string;
    banner?: string;
  };
}

const DEST = 'uploads/';

const fileUploadMiddleware = async (req: RequestWithImages, res: Response, next: NextFunction) => {
  try {
    //@ts-expect-error whatever
    const profile_image: any | undefined = (req.files.profile || [])[0];

    //@ts-expect-error whatever
    const banner_image: any | undefined = (req.files.banner || [])[0];

    let profile_name: string;
    let banner_name: string;

    if (profile_image) {
      // Create hash using file buffer
      const hash = crypto.createHash('sha256');
      hash.update(profile_image.buffer);

      // Filename `hash.ext`
      const fileName = `${hash.digest('hex')}${path.extname(profile_image.originalname)}`;
      console.log(fileName);

      //  Save to upload directory
      const filePath = `${DEST}${fileName}`;
      fs.writeFileSync(filePath, profile_image.buffer);
      profile_name = fileName;
    }

    if (banner_image) {
      // Create hash using file buffer
      const hash = crypto.createHash('sha256');
      hash.update(banner_image.buffer);

      // Filename `hash.ext`
      const fileName = `${hash.digest('hex')}${path.extname(banner_image.originalname)}`;

      //  Save to upload directory
      const filePath = `${DEST}${fileName}`;
      fs.writeFileSync(filePath, banner_image.buffer);
      banner_name = fileName;
    }

    if (profile_name || banner_name) {
      req.images = { profile: profile_name, banner: banner_name };
      next();
    } else {
      console.log('NO FILES');
      next();
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default fileUploadMiddleware;
