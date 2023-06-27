import { TokenClass } from '@/models/tokens.model';
import { UserClass } from '@/models/users.model';
import { Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

export interface IFavoritesModel {
  user: Ref<UserClass>;
  token: Ref<TokenClass>;
}

export interface Favorite extends IFavoritesModel {
  _id: string;
}
