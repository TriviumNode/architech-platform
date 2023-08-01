import { ArchwayClient, OutstandingRewards, RewardsMsgEncoder, SigningArchwayClient } from "@archwayhq/arch3.js";

export const setRewardsMetadata = async({
    client,
    signer,
    contract,
    rewards_address,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    rewards_address: string;
}) => {
    return await client.setContractMetadata(
        signer,
        {
            contractAddress: contract,
            rewardsAddress: rewards_address,
        },
        'auto'
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

export const claimRewards = async({
    client,
    address,
    num_records,
}:{
    client: SigningArchwayClient,
    address: string,
    num_records: number,
}) => {
    return await client.withdrawContractRewards(address, 100, 'auto');
}
