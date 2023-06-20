import { prop, getModelForClass, modelOptions, mongoose, plugin, Ref } from '@typegoose/typegoose';
import { CollectionProfile, cw721, CollectionModel as CollectionModelInterface } from '@architech/types';
import mongoosastic from 'mongoosastic';
import { esClient } from '@/utils/elasticsearch';

class CollectionProfileClass implements CollectionProfile {
  @prop({ type: String })
  public name?: string;

  @prop({ type: String })
  public description?: string;

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

@plugin(mongoosastic, { esClient: esClient })
@modelOptions({ schemaOptions: { collection: 'collections', timestamps: true } })
export class CollectionClass implements CollectionModelInterface {
  @prop({ type: String, required: true, unique: true })
  public address: string;

  @prop({ type: String, required: true })
  public cw721_name: string;

  @prop({ type: String, required: true })
  public cw721_symbol: string;

  @prop({ type: String, required: false })
  public admin?: string;

  @prop({ type: String, required: true })
  public creator: string;

  @prop({ required: true })
  public collectionProfile: CollectionProfileClass;

  @prop({ type: String, required: true, default: [] })
  public categories!: mongoose.Types.Array<string>;

  @prop({ required: true, default: [] })
  public traits!: mongoose.Types.Array<cw721.Trait>;

  @prop({ type: String, required: true, default: [] })
  public traitTypes!: mongoose.Types.Array<string>;

  @prop({ type: Number, required: true })
  public uniqueTraits: number;

  @prop({ type: String, required: true, default: [] })
  public tokenIds!: mongoose.Types.Array<string>;

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
