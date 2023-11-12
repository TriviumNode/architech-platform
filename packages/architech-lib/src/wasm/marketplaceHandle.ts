import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { marketplace } from "@architech/types";
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
    client: SigningCosmWasmClient,
    signer: string,
    marketplace_contract: string;
    cw721_contract: string;
    token_id: string,
    denom: string,
    amount: string,
}) => {
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
    client: SigningCosmWasmClient,
    signer: string,
    marketplace_contract: string;
    cw20_contract: string;
    cw721_contract: string;
    token_id: string;
    amount: string | number;
}) => {
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
    client: SigningCosmWasmClient;
    signer: string;
    marketplace_contract: string;
    cw20_contract?: string;
    cw721_contract: string;
    token_id: string;
    amount: string;
}) => {
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
    client: SigningCosmWasmClient;
    signer: string;
    marketplace_contract: string;
    cw721_contract: string;
    token_id: string;
}) => {
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