import { minter } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";

export const mintRandom = async({
    client,
    signer,
    minter_contract,
    funds,
    mints = 1,
}:{
    client: SigningArchwayClient,
    signer: string,
    minter_contract: string,
    funds?: { amount: string, denom: string}[],
    mints?: number,
}) => {
    const msg: minter.ExecuteMsg = {
        mint: {
            mints
        }
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