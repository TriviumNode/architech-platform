import { credits } from "@architech/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const getCreditBalance = async ({
    client,
    creditContract,
    address: user,
}:{
    client: CosmWasmClient,
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