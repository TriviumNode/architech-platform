import { CollectionMinterClass } from '@/models/collections.model';
import { Collection, CollectionProfile, cw721 } from '@architech/types';

export interface CreateCollectionData {
  address: string;
  cw721_name: string;
  cw721_symbol: string;
  admin?: string;
  creator: string;
  collectionProfile: CollectionProfile;
  categories: string[];
  traits?: cw721.Trait[];
  traitTypes?: string[];
  tokenIds?: string[];
  totalTokens: number;
  importComplete: boolean;
  hidden: boolean;
  collectionMinter: CollectionMinterClass;
}

export interface StartImportData extends CollectionProfile {
  hidden: boolean;
  categories: string[];
}
