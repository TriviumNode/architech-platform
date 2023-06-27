import { CollectionClass } from '@/models/collections.model';
import { TokenClass } from '@/models/tokens.model';
import { UserClass } from '@/models/users.model';
import { Ref } from '@typegoose/typegoose';

export interface View {
  collectionRef: Ref<CollectionClass>;
  collectionAddress: string;
  tokenRef?: Ref<TokenClass>;
  tokenId?: string;
  viewerRef?: Ref<UserClass>;
  viewerIP: string;
}
