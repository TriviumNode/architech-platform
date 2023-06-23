import { View } from '@/interfaces/views.interface';
import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';
import { CollectionClass } from './collections.model';
import { UserClass } from './users.model';

@modelOptions({ schemaOptions: { collection: 'views', timestamps: true } })
export class ViewClass implements View {
  // @prop({ ref: () => CollectionClass, type: () => String, required: true })
  // public collectionId: Ref<CollectionClass, string>;

  @prop({ ref: () => CollectionClass, type: () => String, required: true })
  public collectionRef: Ref<CollectionClass, string>;

  @prop({ type: String })
  public tokenId?: string;

  @prop({ ref: () => UserClass, type: () => String })
  public viewer?: Ref<UserClass, string>;
}

const ViewModel = getModelForClass(ViewClass);

export default ViewModel;
