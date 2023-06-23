import { marketplace } from "@architech/types";
import type { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build";
type QueryMsg = marketplace.QueryMsg;
// type Ask = marketplace.Ask;

export interface Ask {
    collection: string;
    cw20_contract?: string | null;
    price: string;
    seller: string;
    token_id: string;
}

export const getAllAsks = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query = {
        get_all_asks: {}
    };

    const { asks }: { asks: Ask[] } = await client.queryContractSmart(contract, query);
    return asks;
}

export const getCollectionAsks = async ({
    client,
    contract,
    collection,
}:{
    collection: string;
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: QueryMsg = {
        get_collection_asks: {
            collection
        }
    };

    const { asks }: { asks: Ask[] } = await client.queryContractSmart(contract, query);
    return asks;
}

export const getSellerAsks = async ({
    client,
    contract,
    seller,
}:{
    seller: string;
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query = {
        get_seller_asks: {
            seller
        }
    };

    const { asks }: { asks: Ask[] } = await client.queryContractSmart(contract, query);
    return asks;
}
export const getAsk = async ({
    client,
    contract,
    collection,
    token_id
}:{
    collection: string;
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    token_id: string,
}) => {
    const query: QueryMsg = {
        ask: {
            collection,
            token_id
        }
    };

    const { ask }: { ask: Ask } = await client.queryContractSmart(contract, query);
    return ask;
}

// export const getTxHistory = async ({
//     client,
//     contract,
// }:{
//     client: SigningArchwayClient | ArchwayClient,
//     contract: string,
// }) => {
//     const query: QueryMsg = {
//         get_all_history: {}
//     };

//     const {events} = await client.queryContractSmart(contract, query);
//     return events;
// }

export const getVolume = async ({
    client,
    contract,
    collection
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    collection: string,
}): Promise<any[]> => {
    const query: QueryMsg = {
        get_collection_volume: {
            collection
        }
    };

    const {volume} = await client.queryContractSmart(contract, query);
    return volume;
}

export const getCollectionDossier = async ({
    client,
    contract,
    collection
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    collection: string,
}) => {
    const query: QueryMsg = {
        collection_dossier: {
            collection
        }
    };

    const response: {volume: marketplace.Volume[], asks: []} = await client.queryContractSmart(contract, query);
    return response;
}

export const getBatchCollectionDossier = async ({
    client,
    contract,
    collections
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    collections: string[],
}) => {
    const query: QueryMsg = {
        batch_collection_dossier: {
            collections
        }
    };

    const response: {volume: marketplace.Volume[], asks: []}[] = await client.queryContractSmart(contract, query);
    return response;
}