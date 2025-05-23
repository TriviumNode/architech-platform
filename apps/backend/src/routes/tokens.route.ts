import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import {
  getCollectionTokenCount,
  getCollectionTokenId,
  getCollectionTokens,
  getLatestListings,
  getTokensByOwner,
  purgeAsks,
  refreshAsks,
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
    // Get Latest listed tokens live from marketplace contract
    this.router.get(`${this.path}/latest_listings`, getLatestListings);

    // Get number of imported tokens in collection.
    this.router.get(`${this.path}/count/:collectionAddr`, getCollectionTokenCount);

    // Get detail list of tokens in collection
    this.router.get(`${this.path}/collection/:collectionAddr`, getCollectionTokens);

    // Get details of specific token_id
    this.router.get(`${this.path}/collection/:collectionAddr/:tokenId`, optionalAuthMiddleware, getCollectionTokenId);

    // Purge asks from DB for a specified collection
    this.router.get(`${this.path}/purgeAsks/:collectionAddr`, authMiddleware, purgeAsks);

    // Import asks from on chain into DB for a specified collection
    this.router.get(`${this.path}/refreshAsks/:collectionAddr`, authMiddleware, refreshAsks);

    // Get details of tokens owned by specific address
    this.router.get(`${this.path}/owner/:owner`, getTokensByOwner);

    // Favorite a token
    this.router.post(`${this.path}/favorite/:tokenId`, authMiddleware, addFavorite);

    // Favorite a token
    this.router.delete(`${this.path}/favorite/:tokenId`, authMiddleware, removeFavorite);

    // Refresh token metadata from chain
    // Authentication not needed for this, UI triggers refresh on transfer
    this.router.get(`${this.path}/refresh/:collectionAddr/:tokenId`, refreshToken);
    this.router.post(`${this.path}/refresh/:collectionAddr/:tokenId`, refreshToken);
  }
}

export default TokensRoute;
