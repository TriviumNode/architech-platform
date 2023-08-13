import type { minter } from "@architech/types";
import { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build";
type QueryMsg = minter.QueryMsg;
type GetConfigResponse = minter.GetConfigResponse;
type GetMintLimitResponse = minter.GetMintLimitResponse;
type GetMintStatusResponse = minter.GetMintStatusResponse;
type GetPriceResponse = minter.GetPriceResponse;

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

    const result: GetMintStatusResponse = await client.queryContractSmart(contract, query);
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

    const result: GetPriceResponse = await client.queryContractSmart(contract, query);
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

export const getMintLimit = async ({
    client,
    contract,
    buyer,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    buyer: string,
}) => {
    const query: QueryMsg = {
        get_mint_limit: {
            sender: buyer
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}