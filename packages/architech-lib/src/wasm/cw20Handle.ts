import type { SigningArchwayClient } from "@archwayhq/arch3.js";
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import type { Coin } from "@cosmjs/amino";
import type { cw20 } from "@architech/types";
type Cw20ExecuteMsg = cw20.ExecuteMsg

export const sendTokens = async({
    client,
    signer,
    contract,
    amount,
    recipient,
    subMsg,
    funds = []
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    amount: string;
    recipient: string;
    subMsg: any;
    funds?: Coin[]
}): Promise<ExecuteResult> => {
    const msg: Cw20ExecuteMsg = {
        send: {
            contract: recipient,
            amount,
            msg: Buffer.from(JSON.stringify(subMsg)).toString('base64'),
        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        'auto',
    )
    const handle = Object.keys(subMsg)[0];
    //@ts-ignore-error
    gasUsage[handle] ? gasUsage[handle].push(result.gasUsed) : gasUsage[handle] = [result.gasUsed];
    return result;

}

export const transferTokens = async({
    client,
    signer,
    contract,
    amount,
    recipient,
    funds = []
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    amount: string;
    recipient: string;
    funds?: Coin[]
}): Promise<ExecuteResult> => {
    const msg: Cw20ExecuteMsg = {
        transfer: {
            recipient,
            amount,
        }
    }

    const result = await client.execute(
        signer,
        contract,
        msg,
        'auto',
        undefined,
        
    )
    return result;

}