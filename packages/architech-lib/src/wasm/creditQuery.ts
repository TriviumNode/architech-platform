import type { credits } from "@architech/types";
import type { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js";

export const getCreditBalance = async ({
    client,
    creditContract,
    address: user,
}:{
    client: SigningArchwayClient | ArchwayClient,
    creditContract: string,
    address: string,
}) => {
    const query: credits.QueryMsg = {
        check_balance: {
            user,
        }
    };

    const result = await client.queryContractSmart(creditContract, query);
    return result.check_balance.amount as string;
}