import { View } from '@/interfaces/views.interface';
import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';
import { CollectionClass } from './collections.model';
import { TokenClass } from './tokens.model';
import { UserClass } from './users.model';

@modelOptions({ schemaOptions: { collection: 'views', timestamps: true } })
export class ViewClass implements View {
  @prop({ ref: () => CollectionClass, required: true })
  public collectionRef!: Ref<CollectionClass>;

  @prop({ type: String, required: true })
  public collectionAddress!: string;

  @prop({ ref: () => TokenClass })
  public tokenRef?: Ref<TokenClass>;

  @prop({ type: String })
  public tokenId?: string;

  @prop({ ref: () => UserClass })
  public viewerRef?: Ref<UserClass>;

  @prop({ type: String, required: true })
  public viewerIP!: string;
}

const ViewModel = getModelForClass(ViewClass);

export default ViewModel;
