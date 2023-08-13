import { cw2981, marketplace } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MARKETPLACE_ADDRESS } from "../queryClient";
import { Buffer } from 'buffer';

export const mintAndList = async ({
    client,
    signer,
    owner,
    nft_address,
    token_id,
    extension,
    amount,
}:{
    client: SigningArchwayClient;
    signer: string;
    owner: string;
    nft_address: string;
    token_id: string;
    extension: cw2981.Metadata;
    amount: string;
}) => {
    // Mint NFT
    const mintMsg: cw2981.ExecuteMsg = {
        mint: {
            owner,
            token_id,
            extension,
        }
    }
    const MintExecMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          contract: nft_address,
          msg: Buffer.from(JSON.stringify(mintMsg)),
          sender: signer,
        }),
    };

    // List on Marketplace
    const cw721Msg: marketplace.Cw721HookMsg = {
        set_listing: {
            amount,
        }
    }
    const listMsg: cw2981.ExecuteMsg = {
        send_nft: {
            contract: MARKETPLACE_ADDRESS,
            msg: Buffer.from(JSON.stringify(cw721Msg)).toString('base64'),
            token_id,
        }
    }
    const ListExecMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
            contract: nft_address,
            msg: Buffer.from(JSON.stringify(listMsg)),
            sender: signer,
        }),
    };

    const result = await client.signAndBroadcast(signer, [MintExecMsg, ListExecMsg], 'auto');
    if (result.code) throw result;
    else return result;
}