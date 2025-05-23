/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export interface Ask {
  collection: string;
  cw20_contract?: string | null;
  denom?: string | null;
  id: number;
  price: Uint128;
  seller: string;
  token_id: string;
  [k: string]: unknown;
}
export type Cw20HookMsg = {
  purchase: {
    cw721_contract: string;
    token_id: string;
    [k: string]: unknown;
  };
};
export type Cw721HookMsg = {
  set_listing: {
    amount: Uint128;
    cw20_contract?: string | null;
    [k: string]: unknown;
  };
};
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  receive_nft: Cw721ReceiveMsg;
} | {
  purchase_native: {
    collection: string;
    token_id: string;
    [k: string]: unknown;
  };
} | {
  remove_listing: {
    collection: string;
    token_id: string;
    [k: string]: unknown;
  };
} | {
  edit_admin_fee: {
    new_fee: Fee;
    [k: string]: unknown;
  };
} | {
  edit_credit_contract: {
    new_contract: string;
    [k: string]: unknown;
  };
};
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
  [k: string]: unknown;
}
export interface Cw721ReceiveMsg {
  msg: Binary;
  sender: string;
  token_id: string;
  [k: string]: unknown;
}
export interface Fee {
  decimal_places: number;
  rate: number;
  recipient: string;
  [k: string]: unknown;
}
export interface InstantiateMsg {
  admin_fee: Fee;
  credit_contract: string;
  marketplace_admin: string;
  native_denom: string;
  [k: string]: unknown;
}
export type QueryMsg = {
  ask: {
    collection: string;
    token_id: string;
    [k: string]: unknown;
  };
} | {
  get_all_asks: {
    limit?: number | null;
    start_after?: Uint64 | null;
    [k: string]: unknown;
  };
} | {
  get_seller_asks: {
    seller: string;
    [k: string]: unknown;
  };
} | {
  get_collection_asks: {
    collection: string;
    [k: string]: unknown;
  };
} | {
  get_collection_volume: {
    collection: string;
    [k: string]: unknown;
  };
} | {
  collection_dossier: {
    collection: string;
    [k: string]: unknown;
  };
} | {
  batch_collection_dossier: {
    collections: string[];
    [k: string]: unknown;
  };
};
export type Uint64 = string;
export interface Volume {
  amount: Uint128;
  cw20_contract?: string | null;
  denom?: string | null;
  [k: string]: unknown;
}