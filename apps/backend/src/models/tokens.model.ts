import { cw721, ITokenModel, marketplace } from '@architech/types';
import { prop, getModelForClass, modelOptions, mongoose, Ref, plugin } from '@typegoose/typegoose';
import { CollectionClass } from './collections.model';
import paginate from 'mongoose-paginate-v2';
import { FilterQuery, PaginateOptions, PaginateResult } from 'mongoose';

// type PaginateMethod<T> = (
//   query?: FilterQuery<T>,
//   options?: PaginateOptions,
//   callback?: (err: any, result: PaginateResult<T>) => void,
// ) => Promise<PaginateResult<T>>;

@plugin(paginate)
export class PaginatedModel {
  static paginate: <T extends PaginatedModel>(
    this: T,
    query?: FilterQuery<T>,
    options?: PaginateOptions,
    callback?: (err: Error, result: PaginateResult<T>) => void,
  ) => Promise<PaginateResult<T>>;
}

// @plugin(paginate)
@modelOptions({ schemaOptions: { collection: 'tokens', timestamps: true } })
export class TokenClass extends PaginatedModel implements ITokenModel {
  @prop({ type: String, required: true })
  public tokenId: string;

  @prop({ type: String, required: true })
  public collectionAddress: string;

  @prop({ ref: () => CollectionClass, type: () => String, required: true })
  public collectionInfo: Ref<CollectionClass, string>;

  @prop({ type: String, required: false })
  public metadataUri?: string;

  @prop({ type: mongoose.Schema.Types.Mixed, required: false })
  public metadataExtension?: cw721.Metadata;

  @prop({ type: String, required: true })
  public owner: string;

  @prop({ type: String, required: true })
  public averageColor: string;

  @prop({ type: Number, required: true, default: 0 })
  public total_views: number;

  @prop({ required: true })
  public traits!: mongoose.Types.Array<cw721.Trait>;

  @prop({ type: mongoose.Schema.Types.Mixed })
  public ask?: marketplace.Ask;

  public createdAt?: Date;

  public updatedAt?: Date;
}

const TokenModel = getModelForClass(TokenClass);

export default TokenModel;
