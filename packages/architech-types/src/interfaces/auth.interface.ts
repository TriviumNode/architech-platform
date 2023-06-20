import { Request } from 'express';
import { User } from "./users.interface";

export interface DataStoredInToken {
    _id: string;
}
  
export interface TokenData {
    token: string;
    expiresIn: number;
}
  
export interface RequestWithUser extends Request {
    user: User;
}

export interface RequestWithOptionalUser extends Request {
    user?: User;
}

export interface NonceRequest {
    address: string;
    pubKey: string;
}

export interface NonceResponse {
    address: string;
    nonce: string;
}

export interface WalletLogin {
    pubKey: string;
    signature: string;
}