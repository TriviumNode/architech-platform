import { IFavoritesModel } from '@/interfaces/favorites.interface';
import FavoritesModel from '@/models/favorites.model';
import UserModel from '@/models/users.model';
import mongoose from 'mongoose';

export const findUserFavorites = async (address: string) => {
  const user = await UserModel.findOne({ address });
  if (!user) return [];
  return await FavoritesModel.find({ user: user._id }).populate('token');
};

export const findFavoritesCount = async (tokenId: string) => {
  console.log('finding fav count for', tokenId);
  return await FavoritesModel.count({ token: tokenId });
};

export const createFavorite = async (userId: string, tokenId: string) => {
  const exists = await FavoritesModel.findOne({ user: userId, token: tokenId });
  if (exists) return exists;

  const fav: IFavoritesModel = {
    token: new mongoose.Types.ObjectId(tokenId),
    user: new mongoose.Types.ObjectId(userId),
  };
  return await FavoritesModel.create(fav);
};

export const deleteFavorite = async (userId: string, tokenId: string) => {
  await FavoritesModel.findOneAndDelete({ user: userId, token: tokenId });
};

export const deleteFavoriteById = async (favId: string) => {
  await FavoritesModel.findByIdAndDelete(favId);
};
