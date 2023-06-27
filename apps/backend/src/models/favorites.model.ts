import { IFavoritesModel } from '@/interfaces/favorites.interface';
import { View } from '@/interfaces/views.interface';
import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { CollectionClass } from './collections.model';
import { TokenClass } from './tokens.model';
import { UserClass } from './users.model';

@modelOptions({ schemaOptions: { collection: 'favorites', timestamps: true } })
export class FavoritesClass implements IFavoritesModel {
  @prop({ ref: () => TokenClass, type: () => String, required: true })
  public token: Ref<ObjectId>;

  @prop({ ref: () => UserClass, type: () => String, required: true })
  public user: Ref<ObjectId>;
}

const FavoritesModel = getModelForClass(FavoritesClass);

export default FavoritesModel;
