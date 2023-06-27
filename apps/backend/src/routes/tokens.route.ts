import { Router } from 'express';
import { CreateUserDto } from '@architech/types';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {
  getAllTokens,
  getCollectionTokenCount,
  getCollectionTokenId,
  getCollectionTokens,
  getLatestListings,
  getTokensByOwner,
  refreshToken,
} from '@/controllers/tokens.controller';
import authMiddleware, { optionalAuthMiddleware } from '@/middlewares/auth.middleware';
import { addFavorite, removeFavorite } from '@/controllers/favorites.controller';

class TokensRoute implements Routes {
  public path = '/tokens';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all tokens
    // TODO: Pagination or remove
    this.router.get(`${this.path}`, getAllTokens);

    // Get number of imported tokens in collection.
    this.router.get(`${this.path}/latest_listings`, getLatestListings);

    // Get number of imported tokens in collection.
    this.router.get(`${this.path}/count/:collectionAddr`, getCollectionTokenCount);

    // Get details of tokens in collection
    this.router.get(`${this.path}/collection/:collectionAddr`, getCollectionTokens);

    // Get details of specific token_id
    // TODO: Try to fetch from chain when token is not found.
    this.router.get(`${this.path}/collection/:collectionAddr/:tokenId`, optionalAuthMiddleware, getCollectionTokenId);

    // Get details of tokens owned by specific address
    this.router.get(`${this.path}/owner/:owner`, getTokensByOwner);

    // Favorite a token
    this.router.post(`${this.path}/favorite/:tokenId`, authMiddleware, addFavorite);

    // Favorite a token
    this.router.delete(`${this.path}/favorite/:tokenId`, authMiddleware, removeFavorite);

    // Refresh token metadata from chain
    // Authentication probably not needed for this...
    this.router.get(`${this.path}/refresh/:collectionAddr/:tokenId`, refreshToken);
    this.router.post(`${this.path}/refresh/:collectionAddr/:tokenId`, refreshToken);
  }
}

export default TokensRoute;
