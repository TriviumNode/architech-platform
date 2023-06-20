import { marketplace } from "@architech/types";
import type { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build";

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

    const result = await client.queryContractSmart(contract, query);
    return result;
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
    const query: marketplace.QueryMsg = {
        get_collection_asks: {
            collection
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

// export const getTxHistory = async ({
//     client,
//     contract,
// }:{
//     client: SigningArchwayClient | ArchwayClient,
//     contract: string,
// }) => {
//     const query: marketplace.QueryMsg = {
//         get_all_history: {}
//     };

//     const {events} = await client.queryContractSmart(contract, query);
//     return events;
// }