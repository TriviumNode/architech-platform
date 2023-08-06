import { prop, getModelForClass, modelOptions, mongoose, plugin, index } from '@typegoose/typegoose';
import { CollectionProfile, cw721, MinterType, PaymentType, CollectionMinterI, MinterPaymentI } from '@architech/types';
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

export class MinterPaymentClass implements MinterPaymentI {
  @prop({ type: String, required: true })
  public type: PaymentType;

  @prop({ type: String })
  public token?: string;

  @prop({ type: String })
  public denom?: string;

  @prop({ type: String, required: true })
  public amount: string;
}

export class CollectionMinterClass implements CollectionMinterI {
  @prop({ type: String, required: true })
  public minter_address: string;

  @prop({ type: String, required: true })
  public minter_type: MinterType;

  @prop({ type: String, required: true })
  public minter_admin: string;

  @prop({ type: String })
  public beneficiary?: string;

  @prop()
  public payment?: MinterPaymentClass;

  @prop()
  public whitelist_payment?: MinterPaymentClass;

  // Epoch
  @prop({ type: String })
  public launch_time: string | undefined;

  // Epoch
  @prop({ type: String })
  public whitelist_launch_time: string | undefined;

  // Epoch
  @prop({ type: String })
  public end_time: string | undefined;

  @prop({ type: Number })
  public mint_limit: number | undefined;

  // For copy minters
  @prop({ type: Number })
  public max_copies: number | undefined;
}

@index(
  { name: 'text', description: 'text' },
  {
    weights: {
      name: 10,
      description: 5,
    },
  },
)
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

@index(
  { cw721_name: 'text', creator: 'text', admin: 'text', 'collectionProfile.name': 'text' },
  {
    weights: {
      cw721_name: 8,
      creator: 1,
      admin: 1,
      'collectionProfile.name': 10,
    },
  },
)
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

  @prop()
  public collectionMinter?: CollectionMinterClass;

  public createdAt?: Date;

  public updatedAt?: Date;
}

const CollectionModel = getModelForClass(CollectionClass);

export default CollectionModel;
