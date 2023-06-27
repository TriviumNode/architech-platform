import { IFavoritesModel } from '@/interfaces/favorites.interface';
import { View } from '@/interfaces/views.interface';
import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { CollectionClass } from './collections.model';
import { TokenClass } from './tokens.model';
import { UserClass } from './users.model';

@modelOptions({ schemaOptions: { collection: 'favorites', timestamps: true } })
export class FavoritesClass implements IFavoritesModel {
  @prop({ ref: () => TokenClass, required: true })
  public token!: Ref<TokenClass>;

  @prop({ ref: () => UserClass, required: true })
  public user!: Ref<UserClass>;
}

const FavoritesModel = getModelForClass(FavoritesClass);

export default FavoritesModel;
