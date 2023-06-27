import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@architech/types';
import { createFavorite, deleteFavorite, findUserFavorites } from '@/services/favorites.service';
import { HttpException } from '@/exceptions/HttpException';

// HTTP
// Gets a list of a user's favorite tokens
export const getFavorites = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userAddress: string = req.params.address;
    const favs = await findUserFavorites(userAddress);
    res.status(200).json(favs);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Adds token to user's favorute list
// Requires authentication.
export const addFavorite = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const tokenId: string = req.params.tokenId;
    if (!tokenId) throw new HttpException(400, 'tokenId is empty');

    const userId: string = req.user._id.toString();

    const fav = await createFavorite(userId, tokenId);
    res.status(200).json(fav);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Removed token to user's favorute list
// Requires authentication.
export const removeFavorite = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const tokenId: string = req.params.tokenId;
    const userId: string = req.user._id.toString();

    const deletedFav = await deleteFavorite(userId, tokenId);
    res.status(200).json(deletedFav);
  } catch (error) {
    next(error);
  }
};
