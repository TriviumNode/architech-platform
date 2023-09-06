import { cw721, marketplace } from "../contracts";
import { Token } from "./tokens.interface";
import { Ref } from '@typegoose/typegoose';
import mongoose from "mongoose";
import { MinterType, PaymentType } from "..";

export interface CollectionMinterI {
  minter_address: string;
  minter_type: MinterType;
  minter_admin: string;
  beneficiary?: string;
  // payment_type: PaymentType;
  // payment_token?: string;
  // payment_denom?: string;
  // payment_amount: string;
  payment?: MinterPaymentI;
  whitelist_payment?: MinterPaymentI;

  // Epoch
  launch_time?: string;

  // Epoch
  end_time?: string;

  // Epoch
  whitelist_launch_time?: string;

  // For copy minters
  mint_limit?: number;

  ended: boolean;
}

export interface MinterPaymentI {
  type: PaymentType;
  token?: string;
  denom?: string;
  amount: string;
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

  dark_banner?: boolean;
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
  tokenIds: string[];
  totalTokens: number;
  importComplete: boolean;
  hidden: boolean;
  admin_hidden: boolean;
  featured: boolean;
  verified: boolean;
  total_views: number;
  collectionMinter?: CollectionMinterI;
  createdAt?: Date;
  updatedAt?: Date;
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
  full_creator: {
    display: string;
    address: string;
  };
}

export type GetTrendingCollectionResponse = TrendingCollectionResult[];

export type TrendingCollectionResult = {
  collection: Collection;
  count: number;
  asks: marketplace.Ask[];
  volume: marketplace.Volume[];
};