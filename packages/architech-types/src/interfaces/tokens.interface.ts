import { cw721, marketplace } from "../contracts";
import { Collection } from "./collections.interface";

export interface ITokenModel {
    tokenId: string;
    collectionAddress: string;
    metadataUri?: string;
    metadataExtension?: cw721.Metadata;
    owner: string;
    averageColor: string;
    total_views: number;
    traits: cw721.Trait[];
    ask?: marketplace.Ask;
    collectionInfo: Collection;
}

export interface Token extends ITokenModel {
    _id: string;
}

export interface GetTokenResponse {
    token: Token;
    ask: marketplace.Ask;
    favorites: number;
    ownerName: string;
}

export interface GetLatestListingsResponse {
    ask: marketplace.Ask;
    token: Token;
    collection: Collection;
}