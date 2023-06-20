import { cw721, TokenModel as TokenModelInterface } from '@architech/types';
import { prop, getModelForClass, modelOptions, mongoose, Ref } from '@typegoose/typegoose';
import { CollectionClass } from './collections.model';

@modelOptions({ schemaOptions: { collection: 'tokens', timestamps: true } })
export class TokenClass implements TokenModelInterface {
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
}

const TokenModel = getModelForClass(TokenClass);

export default TokenModel;
