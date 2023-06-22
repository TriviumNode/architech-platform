import { NextFunction, Request, Response } from 'express';
import { refreshCollection, startImportCollection } from '@services/collections.service';
import { queryClient } from '@/utils/chainClients';
import * as tokenService from '@/services/tokens.service';
import { CollectionModel, cw721, RequestWithOptionalUser, SortOption, Token } from '@architech/types';

import { MARKETPLACE_ADDRESS } from '@/../../../packages/architech-lib/dist';
import ViewModel from '@/models/views.model';
import { getAsk, getCollectionAsks } from '@/utils/queries/marketplaceQuery';
import { View } from '@/interfaces/views.interface';
import TokenModel from '@/models/tokens.model';
import { HttpException } from '@/exceptions/HttpException';

export const getAllTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findAllTokensData: Token[] = await tokenService.findAllTokens();

    res.status(200).json(findAllTokensData);
  } catch (error) {
    next(error);
  }
};

export const getTokensByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const owner: string = req.params.owner;
    const findTokensData: Token[] = await tokenService.findTokensByOwner(owner);

    res.status(200).json(findTokensData);
  } catch (error) {
    next(error);
  }
};

export const getCollectionTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('QUERYYY', req.query);
    const collectionAddr: string = req.params.collectionAddr;

    const sort: SortOption = (req.query.sort as SortOption) || 'Name';

    let traitFilter: cw721.Trait[] = [];
    if (req.query.traits) {
      try {
        traitFilter = JSON.parse(req.query.traits as string) as cw721.Trait[];
      } catch {}
    }
    const findAllTokensData: Token[] = await tokenService.findCollectionTokens(
      collectionAddr,
      req.query.page ? parseInt(req.query.page as string) : undefined,
      req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort,
      traitFilter,
    );

    res.status(200).json(findAllTokensData);
  } catch (error) {
    next(error);
  }
};

export const getCollectionTokenCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collectionAddr: string = req.params.collectionAddr;
    const tokenCount = await tokenService.findCollectionTokenCount(collectionAddr);

    const response = {
      address: collectionAddr,
      tokenCount,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCollectionTokenId = async (req: RequestWithOptionalUser, res: Response, next: NextFunction) => {
  try {
    const collectionAddr: string = req.params.collectionAddr;
    const tokenId: string = req.params.tokenId;
    const tokenData: Token = await tokenService.findTokenIdInCollection(tokenId, collectionAddr);
    if (tokenData) {
      // Increment view count
      const userId: string = req.user?._id;
      const view: View = {
        collectionAddress: tokenData.collectionAddress,

        viewer: userId ? userId : undefined,
      };

      await ViewModel.create(view);
      const updated = await TokenModel.findByIdAndUpdate(tokenData._id, { $inc: { total_views: 1 } }, { new: true });

      const forSale = await getAsk({
        client: queryClient,
        contract: MARKETPLACE_ADDRESS,
        collection: tokenData.collectionAddress,
        token_id: tokenData.tokenId,
      });
      console.log('forSale!!!!!!!!!!!!!!!!', forSale);

      const response = {
        token: updated,
        sale: forSale,
      };

      res.status(200).json(response);
    } else {
      throw new HttpException(404, 'Token not found.');
    }
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collectionAddr: string = req.params.collectionAddr;
    const tokenId: string = req.params.tokenId;
    const tokenData: Token = await tokenService.refreshToken(tokenId, collectionAddr);

    res.status(200).json(tokenData);
  } catch (error) {
    next(error);
  }
};

//   public getTokenById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tokenId: string = req.params.id;
//       const findOneTokenData: Token = await this.tokenService.findTokenById(tokenId);

//       res.status(200).json({ data: findOneTokenData, message: 'findOne' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tokenData: CreateTokenDto = req.body;
//       const createTokenData: Token = await this.tokenService.createToken(tokenData);

//       res.status(201).json({ data: createTokenData, message: 'created' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tokenId: string = req.params.id;
//       const tokenData: CreateTokenDto = req.body;
//       const updateTokenData: Token = await this.tokenService.updateToken(tokenId, tokenData);

//       res.status(200).json({ data: updateTokenData, message: 'updated' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public deleteToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const tokenId: string = req.params.id;
//       const deleteTokenData: Token = await this.tokenService.deleteToken(tokenId);

//       res.status(200).json({ data: deleteTokenData, message: 'deleted' });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default TokensController
