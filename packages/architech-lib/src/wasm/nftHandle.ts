import type { SigningArchwayClient } from "@archwayhq/arch3.js";
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import type { cw2981, cw721 } from '@architech/types'

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
}): Promise<ExecuteResult> => {
    const msg: ExecuteMsg = {
        send_nft: {
            contract: recipient,
            token_id: tokenId,
            msg: btoa(JSON.stringify(subMsg))
        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        'auto',
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
}): Promise<ExecuteResult> => {
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
        'auto',
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
}): Promise<ExecuteResult> => {
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
        'auto',
    )
    return result;

}

export const transferNft = async({
  client,
  signer,
  contract,
  tokenId,
  recipient,
}:{
  client: SigningArchwayClient,
  signer: string,
  contract: string,
  tokenId: string;
  recipient: string;
}): Promise<ExecuteResult> => {
  const msg: ExecuteMsg = {
    transfer_nft: {
      token_id: tokenId,
      recipient
    }
  }

  const result = await client.execute(
    signer,
    contract,
    msg,
    'auto',
  )
  return result;
}