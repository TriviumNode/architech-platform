import type { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js";
import type { cw20 } from "@architech/types";
type QueryMsg = cw20.QueryMsg;

export const getTokenInfo = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: QueryMsg = {
        token_info: {}
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

export const getBalance = async ({
    client,
    contract,
    address,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    address: string,
}) => {
    const query: QueryMsg = {
        balance: {
            address,
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result.balance;
}