import { esClient } from '@/utils/elasticsearch';
import { UserModel as UserModelInterface } from '@architech/types';
import { prop, getModelForClass, modelOptions, plugin } from '@typegoose/typegoose';
import mongoosastic from 'mongoosastic';

@plugin(mongoosastic, { esClient: esClient })
@modelOptions({ schemaOptions: { collection: 'users', timestamps: true } })
export class UserClass implements UserModelInterface {
  @prop({ type: String, required: true, unique: true, es_indexed: true })
  public address: string;

  @prop({ type: String, required: true, es_indexed: false })
  public pubKey: string;

  @prop({ type: String, required: true, es_indexed: false })
  public nonce: string;

  @prop({ type: Boolean, required: true, default: true, es_indexed: false })
  public firstLogin: boolean;

  @prop({ type: String, es_indexed: true })
  public username?: string;

  @prop({ type: String })
  public bio?: string;

  @prop({ type: String })
  public profile_image?: string;

  @prop({ type: String })
  public twitter?: string;

  @prop({ type: String })
  public discord?: string;

  @prop({ type: String })
  public telegram?: string;

  @prop({ type: String })
  public website?: string;

  @prop({ type: Boolean, required: true, default: false })
  public verified: boolean;

  public createdAt?: Date;

  public updatedAt?: Date;
}

const UserModel = getModelForClass(UserClass);

export default UserModel;
