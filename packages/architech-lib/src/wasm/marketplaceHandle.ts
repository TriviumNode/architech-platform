import type { marketplace } from "@architech/types";
import type { SigningArchwayClient } from "@archwayhq/arch3.js";
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import { sendTokens } from "./cw20Handle";
import { sendNft } from "./nftHandle";
type ExecuteMsg = marketplace.ExecuteMsg

export const purchaseNative = async({
    client,
    signer,
    marketplace_contract,
    cw721_contract,
    token_id,
    denom,
    amount,
}:{
    client: SigningArchwayClient,
    signer: string,
    marketplace_contract: string;
    cw721_contract: string;
    token_id: string,
    denom: string,
    amount: string,
}): Promise<ExecuteResult> => {
    const msg: ExecuteMsg = {
        purchase_native: {
            collection: cw721_contract,
            token_id,
        }
    }

    const result = await client.execute(
        signer,
        marketplace_contract,
        msg,
        'auto',
        undefined,
        [{ amount, denom }]
    )
    return result;

}

export const purchaseCw20 = async({
    client,
    signer,
    marketplace_contract,
    cw20_contract,
    cw721_contract,
    token_id,
    amount,
}:{
    client: SigningArchwayClient,
    signer: string,
    marketplace_contract: string;
    cw20_contract: string;
    cw721_contract: string;
    token_id: string;
    amount: string | number;
}): Promise<ExecuteResult> => {
    const buyMsg = {
        purchase: {
            cw721_contract,
            token_id,
        }
    }

    const buyResult = await sendTokens({
        client: client,
        signer: signer,
        contract: cw20_contract,
        amount: amount.toString(),
        recipient: marketplace_contract,
        subMsg: buyMsg,
    });
    return buyResult;
}

export const listToken = async({
    client,
    signer,
    marketplace_contract,
    cw20_contract,
    cw721_contract,
    token_id,
    amount,
}:{
    client: SigningArchwayClient;
    signer: string;
    marketplace_contract: string;
    cw20_contract?: string;
    cw721_contract: string;
    token_id: string;
    amount: string;
}): Promise<ExecuteResult> => {
    const listMsg = {
        set_listing: {
            cw20_contract,
            amount: amount,
        }
    }

    return await sendNft({
        client,
        signer,
        contract: cw721_contract,
        tokenId: token_id,
        recipient: marketplace_contract,
        subMsg: listMsg,
    })
}

export const cancelListing = async({
    client,
    signer,
    marketplace_contract,
    cw721_contract,
    token_id,
}:{
    client: SigningArchwayClient;
    signer: string;
    marketplace_contract: string;
    cw721_contract: string;
    token_id: string;
}): Promise<ExecuteResult> => {
    const msg: ExecuteMsg = {
        remove_listing: {
            collection: cw721_contract,
            token_id: token_id
        }
    }

    return await client.execute(
        signer,
        marketplace_contract,
        msg,
        'auto',
        undefined,
    )
}