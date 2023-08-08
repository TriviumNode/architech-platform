import { NextFunction, Request, Response } from 'express';
import { queryClient } from '@/utils/chainClients';
import * as tokenService from '@/services/tokens.service';
import { cw721, GetLatestListingsResponse, GetTokenResponse, RequestWithOptionalUser, SortOption, Token } from '@architech/types';

import { getAllAsks, resolveArchId } from '@architech/lib';
import TokenModel from '@/models/tokens.model';
import { HttpException } from '@/exceptions/HttpException';
import CollectionModel from '@/models/collections.model';
import { findFavoritesCount } from '@/services/favorites.service';
import UserModel from '@/models/users.model';
import mongoose from 'mongoose';
import { addTokenView } from '@/services/view.service';
import { ARCHID_ADDRESS, MARKETPLACE_ADDRESS } from '@/config';

// TODO cache this!!
export const getLatestListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Query latest asks from marketplace contract
    const asks = await getAllAsks({ client: queryClient, contract: MARKETPLACE_ADDRESS, limit: 10 });

    const response: GetLatestListingsResponse[] = [];
    for (let i = 0; i < asks.length; i++) {
      const ask = asks[i];

      const collection = await CollectionModel.findOne({ address: ask.collection });
      if (!collection || collection.hidden || collection.admin_hidden) continue;

      const token = await tokenService.ensureToken(ask.collection, ask.token_id);
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
    console.log('QUERY STRING', req.query);
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
    let tokenData = await tokenService.ensureToken(collectionAddr, tokenId);
    if (tokenData) {
      // Increment view count
      const userId: string = req.user?._id;
      const updated = await addTokenView({
        collectionAddress: tokenData.collectionAddress,
        collectionRef: tokenData.collectionInfo._id,
        tokenRef: tokenData._id,
        tokenId,
        viewerRef: new mongoose.Types.ObjectId(userId),
        viewerIP: (req.headers['x-forwarded-for'] as string) || '0.0.0.0',
      });
      if (updated) tokenData = updated;

      // Get number of likes
      const count = await findFavoritesCount(tokenData._id);

      // Get Arch ID if any
      let ownerName = await resolveArchId(queryClient, ARCHID_ADDRESS, tokenData.owner);

      if (!ownerName) {
        // Get owner profile
        const ownerProfile = await UserModel.findOne({ address: tokenData.owner }).lean();
        ownerName = ownerProfile?.username || tokenData.owner;
      }

      const response: GetTokenResponse = {
        token: tokenData as unknown as Token,
        ask: tokenData.ask,
        favorites: count,
        ownerName,
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
    const tokenData = await tokenService.ensureToken(collectionAddr, tokenId);

    res.status(200).json(tokenData);
  } catch (error) {
    next(error);
  }
};
