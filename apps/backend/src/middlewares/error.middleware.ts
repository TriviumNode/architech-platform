import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { MulterError } from 'multer';

const errorMiddleware = (error: HttpException | MulterError | any, req: Request, res: Response, next: NextFunction) => {
  try {
    let status: number = error.status || error.code || 500;
    const message: string = error.message || 'Something went wrong';

    console.log('ERROR MIDDLEWARE', error);
    if (error.code) {
      if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT') {
        status = 413;
      }
    }

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).send(message);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
