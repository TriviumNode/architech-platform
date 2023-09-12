import { cw721, ITokenModel, marketplace } from '@architech/types';
import { prop, getModelForClass, modelOptions, mongoose, Ref, plugin, defaultClasses } from '@typegoose/typegoose';
import { CollectionClass } from './collections.model';
import paginate from 'mongoose-paginate-v2';
import { FilterQuery, ObjectId, PaginateOptions, PaginateResult } from 'mongoose';

// type PaginateMethod<T> = (
//   query?: FilterQuery<T>,
//   options?: PaginateOptions,
//   callback?: (err: any, result: PaginateResult<T>) => void,
// ) => Promise<PaginateResult<T>>;

class TraitClass implements cw721.Trait {
  @prop({ type: String, required: true })
  public trait_type: string;

  @prop({ type: String, required: true })
  public value: string;

  @prop({ type: String })
  public display_type?: string | null;
}

//@ts-expect-error it's fucky
export class AskClass implements marketplace.Ask {
  @prop({ type: Number, required: true })
  public id: number;

  @prop({ type: String, required: true, index: true })
  public collection: string;

  @prop({ type: String, required: true })
  public token_id: string;

  @prop({ type: String, required: true })
  public seller: string;

  @prop({ type: String, required: true, index: true })
  public price: string;

  @prop({ type: String })
  public denom?: string;

  @prop({ type: String })
  public cw20_contract?: string;
}

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
export class TokenClass extends PaginatedModel {
  @prop({ type: String, required: true })
  public tokenId: string;

  @prop({ type: String, required: true })
  public collectionAddress: string;

  @prop({ ref: () => CollectionClass, required: true })
  public collectionInfo: Ref<CollectionClass>;

  @prop({ type: String })
  public metadataUri?: string;

  @prop({ type: mongoose.Schema.Types.Mixed })
  public metadataExtension?: cw721.Metadata;

  @prop({ type: String, required: true })
  public owner: string;

  @prop({ type: String, required: true })
  public averageColor: string;

  @prop({ type: Number, required: true, default: 0 })
  public total_views: number;

  @prop({ type: () => [TraitClass], required: true, default: [] })
  public traits!: TraitClass[];

  @prop({ type: AskClass })
  public ask?: AskClass;
}

export interface TokenType extends TokenClass {
  _id: mongoose.Types.ObjectId;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const TokenModel = getModelForClass(TokenClass);

export default TokenModel;
