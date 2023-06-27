import { prop, getModelForClass, modelOptions, mongoose, plugin, Ref } from '@typegoose/typegoose';
import { CollectionProfile, cw721, CollectionModel as CollectionModelInterface } from '@architech/types';
import mongoosastic from 'mongoosastic';
import { esClient } from '@/utils/elasticsearch';
import paginate from 'mongoose-paginate-v2';
import { FilterQuery, PaginateOptions, PaginateResult } from 'mongoose';

@plugin(paginate)
export class PaginatedModel {
  static paginate: <T extends PaginatedModel>(
    this: T,
    query?: FilterQuery<T>,
    options?: PaginateOptions,
    callback?: (err: Error, result: PaginateResult<T>) => void,
  ) => Promise<PaginateResult<T>>;
}

class CollectionProfileClass implements CollectionProfile {
  @prop({ type: String })
  public name?: string;

  @prop({ type: String })
  public description?: string;

  // Socials
  @prop({ type: String })
  public website?: string;

  @prop({ type: String })
  public twitter?: string;

  @prop({ type: String })
  public discord?: string;

  @prop({ type: String })
  public telegram?: string;

  // Images are filename
  @prop({ type: String })
  public profile_image?: string;

  @prop({ type: String })
  public banner_image?: string;
}

@plugin(mongoosastic, { esClient: esClient }) // ElasticSearch
@modelOptions({ schemaOptions: { collection: 'collections', timestamps: true } })
export class CollectionClass extends PaginatedModel {
  //implements CollectionModelInterface {

  public _id: mongoose.Types.ObjectId;

  @prop({ type: String, required: true, unique: true })
  public address: string;

  @prop({ type: String, required: true })
  public cw721_name: string;

  @prop({ type: String, required: true })
  public cw721_symbol: string;

  // Archway Contract Admin
  @prop({ type: String })
  public admin?: string;

  // Original Initializer's Address
  @prop({ type: String, required: true })
  public creator: string;

  @prop({ required: true })
  public collectionProfile: CollectionProfileClass;

  @prop({ type: () => [String], required: true, default: [] })
  public categories!: string[];

  @prop({ required: true, default: [] })
  public traits!: mongoose.Types.Array<cw721.Trait>;

  @prop({ type: () => [String], required: true, default: [] })
  public traitTypes!: string[];

  @prop({ type: Number, required: true })
  public uniqueTraits: number;

  @prop({ type: () => [String], required: true, default: [] })
  public tokenIds!: string[];

  @prop({ type: Number, required: true })
  public totalTokens: number;

  @prop({ type: Boolean, required: true })
  public importComplete: boolean;

  @prop({ type: Boolean, required: true })
  public hidden: boolean;

  @prop({ type: Number, required: true, default: 0 })
  public total_views: number;

  public createdAt?: Date;

  public updatedAt?: Date;
}

const CollectionModel = getModelForClass(CollectionClass);

export default CollectionModel;
