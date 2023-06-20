import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { Coin } from "@cosmjs/amino";
import { cw20 } from "@architech/types";
import { getFee } from "../utils";
type Cw20ExecuteMsg = cw20.Cw20ExecuteMsg

export const sendTokens = async({
    client,
    signer,
    contract,
    amount,
    recipient,
    subMsg,
    gas = 500_000,
    funds = []
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    amount: string;
    recipient: string;
    subMsg: any;
    gas?: number;
    funds?: Coin[]
}) => {
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
        getFee(gas),
    )
    return result;

}

export const transferTokens = async({
    client,
    signer,
    contract,
    amount,
    recipient,
    gas = 50_000,
    funds = []
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    amount: string;
    recipient: string;
    gas?: number;
    funds?: Coin[]
}) => {
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
        getFee(gas),
        undefined,
        
    )
    return result;

}