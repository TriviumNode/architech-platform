import { cw721, factory } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { getFee } from "../helpers";

import { COLLECTION_FACTORY_ADDRESS, CW721_CODE_ID } from '@architech/lib'
import secureRandom from "secure-random";

import { Buffer } from 'buffer';

export const initStandardProject = async({
    client,
    signer,
    minter = signer,
    contract_name,
    nft_symbol,
}:{
    client: SigningArchwayClient,
    signer: string,
    minter: string;
    contract_name: string;
    nft_symbol: string;
}) => {
    // const msg: factory.ExecuteMsg = {
    //     init_standard_project: {
    //         collection_admin,
    //         contract_name,
    //         nft_symbol,
    //         label,
    //     }
    // }
    const msg: cw721.InstantiateMsg = {
        minter,
        name: contract_name,
        symbol: nft_symbol,
    }
    const label = `Architech_Collection_${contract_name}_${Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64")}}`;
    const result = await client.instantiate(
        signer,
        CW721_CODE_ID,
        msg as any,
        label,
        getFee(500_000)
    )
    return result;

}