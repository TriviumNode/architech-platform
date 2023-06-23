import { cw721, marketplace } from "../contracts";
import { Token } from "./tokens.interface";
import { Ref } from '@typegoose/typegoose';

export interface CollectionProfile {
  name?: string;
  description?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;

  // file name in public folder
  profile_image?: string;

  // file name in public folder
  banner_image?: string;
}

export interface CollectionModel {
  address: string;
  cw721_name: string;
  cw721_symbol: string;
  admin?: string;
  creator: string;
  collectionProfile: CollectionProfile;
  categories: string[];
  traits: cw721.Trait[];
  traitTypes: string[];
  uniqueTraits: number;
  tokenIds: string[];
  totalTokens: number;
  importComplete: boolean;
  hidden: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Collection extends CollectionModel {
  _id: string;
}

export interface ImportCollectionRequest extends CollectionProfile {
  address: string;
}

export interface GetCollectionResponse {
  collection: Collection;
  asks: marketplace.Ask[];
  volume: marketplace.Volume[];
}

export type GetTrendingCollectionResponse = TrendingCollectionResult[];

export type TrendingCollectionResult = {
  collection: Collection;
  count: number;
  asks: marketplace.Ask[];
  volume: marketplace.Volume[];
};