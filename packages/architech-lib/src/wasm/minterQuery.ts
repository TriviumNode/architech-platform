import type { minter } from "@architech/types";
import { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build";
type QueryMsg = minter.QueryMsg;
type GetConfigResponse = minter.GetConfigResponse;

export const getMintStatus = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: QueryMsg = {
        get_mint_status: {}
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

export const getPrice = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: QueryMsg = {
        get_price: {}
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

export const getConfig = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: QueryMsg = {
        get_config: {}
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}