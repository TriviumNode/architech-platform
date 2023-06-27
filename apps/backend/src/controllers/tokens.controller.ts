import { NextFunction, Request, Response } from 'express';
import { queryClient } from '@/utils/chainClients';
import * as tokenService from '@/services/tokens.service';
import { cw721, GetLatestListingsResponse, GetTokenResponse, marketplace, RequestWithOptionalUser, SortOption, Token } from '@architech/types';

import { getAllAsks, getAllNftInfo, getAsk, getNftInfo, MARKETPLACE_ADDRESS } from '@architech/lib';
import ViewModel from '@/models/views.model';
import { View } from '@/interfaces/views.interface';
import TokenModel from '@/models/tokens.model';
import { HttpException } from '@/exceptions/HttpException';
import CollectionModel from '@/models/collections.model';
import { findFavoritesCount } from '@/services/favorites.service';
import equal from 'fast-deep-equal';
import UserModel from '@/models/users.model';

export const getLatestListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asks = await getAllAsks({ client: queryClient, contract: MARKETPLACE_ADDRESS, limit: 10 });

    const response: GetLatestListingsResponse[] = [];
    for (let i = 0; i < asks.length; i++) {
      const ask = asks[i];

      const collection = await CollectionModel.findOne({ address: ask.collection });
      if (!collection) continue;

      // TODO query token from chain if not in DB
      const token = await TokenModel.findOne({ tokenId: ask.token_id, collectionAddress: ask.collection });
      if (!token) continue;

      response.push({
        ask: ask,
        collection,
        token: token as unknown as Token,
      });
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

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
        collectionRef: tokenData.collectionInfo._id,
        tokenId: tokenId,
        viewer: userId ? userId : undefined,
      };

      await ViewModel.create(view);
      let updated = await TokenModel.findByIdAndUpdate(tokenData._id, { $inc: { total_views: 1 } }, { new: true });

      let ask: marketplace.Ask;
      let owner = tokenData.owner;
      try {
        // Get ask from marketplace (if any)
        ask = await getAsk({
          client: queryClient,
          contract: MARKETPLACE_ADDRESS,
          collection: tokenData.collectionAddress,
          token_id: tokenData.tokenId,
        });

        // Get current owner
        const { access } = await getAllNftInfo({ client: queryClient, contract: tokenData.collectionAddress, token_id: tokenData.tokenId });
        if (access.owner === MARKETPLACE_ADDRESS) owner = ask.seller;
        else owner = access.owner;
      } catch (err: any) {
        console.error('Error fetching toke ask:', err);
      }

      // Get number of likes
      const count = await findFavoritesCount(tokenData._id);

      // Get owner profile
      const ownerProfile = await UserModel.findOne({ address: owner }).lean();

      // Update DB if needed
      if (owner !== tokenData.owner || !equal(ask, tokenData.ask)) {
        updated = await TokenModel.findByIdAndUpdate(tokenData._id, { owner, ask }, { new: true });
      }

      const response: GetTokenResponse = {
        token: updated as unknown as Token,
        ask: ask as marketplace.Ask,
        favorites: count,
        ownerName: ownerProfile?.username || tokenData.owner,
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
