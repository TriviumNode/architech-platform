import { cw721, marketplace } from "../contracts";
import { Token } from "./tokens.interface";
import { Ref } from '@typegoose/typegoose';
import mongoose from "mongoose";
import { MinterType, PaymentType } from "..";

export interface CollectionMinterI {
  minter_address: string;
  minter_type: MinterType;
  minter_admin: string;
  beneficiary: string;
  payment_type: PaymentType;
  payment_token?: string;
  payment_denom?: string;
  payment_amount: string;

  // Epoch
  launch_time?: string;

  // Epoch
  end_time?: string;

  // Epoch
  whitelist_launch_time?: string;

  // For copy minters
  mint_limit?: number;
}

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
  collectionMinter?: CollectionMinterI;
}

export interface Collection extends CollectionModel {
  _id: mongoose.Types.ObjectId;
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