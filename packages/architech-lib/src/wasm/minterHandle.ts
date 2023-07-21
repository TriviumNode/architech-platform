import { cw2981, minter } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { getFee } from "../utils";
// import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
type ExecuteMsg = minter.ExecuteMsg;

export const preloadData = async({
    client,
    signer,
    contract,
    metadata,
    gas = 100_000*metadata.length
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    metadata: cw2981.Metadata[],
    gas?: number,
}) => {
    const msg: ExecuteMsg = {
        preload_data: {
            new_data: metadata
        }
    }

    // const WasmMsg = {
    //     typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    //     value: MsgExecuteContract.fromPartial({
    //       contract,
    //       msg: Buffer.from(JSON.stringify(msg)),
    //       sender: signer
    //     }),
    // };

    // const sim = await client.simulate(signer, [WasmMsg], '')
    // const gasLimit = Math.ceil(sim * 1.05)

    const result = await client.execute(
        signer,
        contract,
        msg,
        getFee(gas),
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
        getFee(400_000),
        undefined,
        funds,
    )
    console.log('Mint Gas Used', result.gasUsed)
    return result;
}