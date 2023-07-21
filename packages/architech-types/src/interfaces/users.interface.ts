import { Collection, GetCollectionResponse } from "./collections.interface";
import { Token } from "./tokens.interface";

export type LoginType = 'auth0' | 'keplr';

export interface UserModel {
  address: string;
  pubKey: string;
  nonce: string;
  firstLogin: boolean;
  username?: string;
  bio?: string;
  profile_image?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
}

export interface User extends UserModel {
  _id: string;
}

export interface GetUserProfileResponse {
  profile?: User;
  display_name: string;
  tokens: Token[];
  collections: GetCollectionResponse[];
  favorites: [{
    _id: string;
    user: string;
    token: Token;
  }]
}