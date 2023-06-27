import { ArchwayClient, OutstandingRewards, SigningArchwayClient } from "@archwayhq/arch3.js";
import { getFee } from "./utils";


export const setRewardsMetadata = async({
    client,
    signer,
    contract,
    rewards_address,
    gas = 100_000,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    rewards_address: string;
    gas?: number;
}) => {
    return await client.setContractMetadata(
        signer,
        {
            contractAddress: contract,
            rewardsAddress: rewards_address,
        },
        getFee(100_000)
    );
}

export const getMetadata = async({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    return await client.getContractMetadata(contract);
}

export const getRewards = async({
    client,
    address,
}:{
    client: SigningArchwayClient | ArchwayClient,
    address: string,
}): Promise<OutstandingRewards | undefined> => {
    try {
        return await client.getOutstandingRewards(address);
    } catch(err: any) {
        if (err.toString().includes('metadata for the contract: not found: key not found'))
            return undefined;
        else
            throw err;
    }
}