import { cw721, marketplace } from "../contracts";
import { Collection } from "./collections.interface";

export interface TokenModel {
    tokenId: string;
    collectionAddress: string;
    metadataUri?: string;
    metadataExtension?: cw721.Metadata;
    owner: string;
    averageColor: string;
    total_views: number;
}

export interface Token extends TokenModel {
    _id: string;
    collectionInfo: Collection;
}

export interface GetTokenResponse {
    token: Token;
    sale: marketplace.Ask;
}