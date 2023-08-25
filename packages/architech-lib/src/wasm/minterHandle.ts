import { cw2981, minter } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
// import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ExecuteInstruction } from '@cosmjs/cosmwasm-stargate'
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
    gas?: string
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

export const setLaunchTime = async({
  client,
  signer,
  minter_contract,
  launch_time,
  whitelist_launch_time,
}:{
  client: SigningArchwayClient,
  signer: string,
  minter_contract: string,
  launch_time?: Date,
  whitelist_launch_time?: Date,
}) => {
  const instructions: ExecuteInstruction[] = [];
  if (launch_time) {
    const msg: ExecuteMsg = {
      set_launch_time: {
        launch_time: Math.floor(launch_time.valueOf() / 1000).toString(),
      }
    }
    instructions.push({
      contractAddress: minter_contract,
      msg
    });
  }
  if (whitelist_launch_time) {
    const msg: ExecuteMsg = {
      set_launch_time: {
        whitelist_launch_time: Math.floor(whitelist_launch_time.valueOf() / 1000).toString(),
      }
    }
    instructions.push({
      contractAddress: minter_contract,
      msg
    });
  }

  const result = await client.executeMultiple(
    signer,
    instructions,
    'auto'
  )

  return result;
}