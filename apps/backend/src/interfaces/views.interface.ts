import { CollectionClass } from '@/models/collections.model';
import { UserClass } from '@/models/users.model';
import { Ref } from '@typegoose/typegoose';

export interface View {
  collectionRef: Ref<CollectionClass, string>;
  tokenId?: string;
  viewer?: Ref<UserClass, string>;
}
