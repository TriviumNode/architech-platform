import { ADMINS } from '@/../../../packages/architech-lib/dist';
import { RequestWithUser } from '@/../../../packages/architech-types/dist';
import { HttpException } from '@/exceptions/HttpException';
import CollectionModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import { Response, NextFunction } from 'express';

export const purgeTokens = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!ADMINS.includes(req.user.address)) throw new HttpException(403, 'Authorization insufficent');

    const collectionAddress = req.params.contractAddr;
    if (!collectionAddress) throw new HttpException(400, 'Contract address not specified');

    console.log('Purging tokens for', collectionAddress);
    await TokenModel.deleteMany({ collectionAddress });
    console.log('Done purging!');
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
};

export const purgeCollection = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!ADMINS.includes(req.user.address)) throw new HttpException(403, 'Authorization insufficent');

    const collectionAddress = req.params.contractAddr;
    if (!collectionAddress) throw new HttpException(400, 'Contract address not specified');

    console.log('Purging collection', collectionAddress);
    await TokenModel.deleteMany({ collectionAddress });
    await CollectionModel.deleteMany({ address: collectionAddress });
    console.log('Done purging collection!');

    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
};
