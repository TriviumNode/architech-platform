import { MARKETPLACE_ADDRESS, CREDIT_ADDRESS, CW721_CODE_ID, CHAIN_ID } from '@/config';
import { NextFunction, Request, Response } from 'express';

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ config: { CHAIN_ID, MARKETPLACE_ADDRESS, CREDIT_ADDRESS, CW721_CODE_ID } });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
