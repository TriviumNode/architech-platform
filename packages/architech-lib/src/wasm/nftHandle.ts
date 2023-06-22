import type { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { cw2981, cw721 } from '@architech/types'
import { getFee } from "../utils";

type ExecuteMsg = cw721.ExecuteMsg;

export const sendNft = async({
    client,
    signer,
    contract,
    tokenId,
    recipient,
    subMsg,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    tokenId: string;
    recipient: string;
    subMsg: any;
}) => {
    const msg: ExecuteMsg = {
        send_nft: {
            contract: recipient,
            token_id: tokenId,
            // msg: Buffer.from(JSON.stringify(subMsg)).toString('base64'),
            msg: btoa(JSON.stringify(subMsg))
        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        getFee(500_000),
    )
    return result;

}

export const mintNft = async({
    client,
    signer,
    contract,
    tokenId,
    extension,
    owner = signer,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    tokenId: string;
    owner?: string;
    extension: cw2981.Metadata
}) => {
    const msg: ExecuteMsg = {
        mint: {
            owner,
            token_id: tokenId,
            extension,
        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        getFee(200_000),
    )
    return result;

}

export const mintRoyaltyNft = async({
    client,
    signer,
    contract,
    tokenId,
    owner = signer,
    royalty_payment_address,
    royalty_percentage
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    tokenId: string;
    owner?: string;
    royalty_payment_address?: string;
    royalty_percentage?: number;
}) => {
    const msg = {
        mint: {
            owner,
            token_id: tokenId,
            extension: {
                royalty_payment_address,
                royalty_percentage
            },

        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        getFee(200_000),
    )
    return result;

}