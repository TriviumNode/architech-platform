import { cw2981, minter } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
// import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
type ExecuteMsg = minter.ExecuteMsg;

export const preloadData = async({
    client,
    signer,
    contract,
    metadata,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    metadata: cw2981.Metadata[],
}) => {
    const msg: ExecuteMsg = {
        preload_data: {
            new_data: metadata
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

export const mintWithMinter = async({
    client,
    signer,
    minter_contract,
    funds,
}:{
    client: SigningArchwayClient,
    signer: string,
    minter_contract: string,
    funds?: { amount: string, denom: string}[],
}) => {
    const msg: ExecuteMsg = {
        mint: {}
    }

    const result = await client.execute(
        signer,
        minter_contract,
        msg,
        'auto',
        undefined,
        funds,
    )
    console.log('Mint Gas Used', result.gasUsed)
    return result;
}