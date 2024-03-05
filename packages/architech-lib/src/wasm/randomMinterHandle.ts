import type { minter } from "@architech/types";
import type { SigningArchwayClient } from "@archwayhq/arch3.js";
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate';

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
}): Promise<ExecuteResult> => {
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