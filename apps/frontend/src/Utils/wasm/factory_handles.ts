/* eslint-disable no-throw-literal */
import { cw2981, factory, minter } from "@architech/types";
import { SigningArchwayClient } from "@archwayhq/arch3.js";
import secureRandom from "secure-random";

import { Buffer } from 'buffer';
import { CW721_CODE_ID } from "../queryClient";

type ExecuteMsg = factory.ExecuteMsg;
type Payment = factory.Payment;

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
    const msg: cw2981.InstantiateMsg = {
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
        'auto',
        {
            admin: signer,
        }
    )
    return result;

}


export const initCopyProject = async({
    client,
    signer,
    contract,
    nft_admin = signer,
    beneficiary = signer,
    minter_admin = signer,
    nft_name = Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64"),
    nft_symbol,
    minter_label = Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64"),
    nft_label = Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64"),
    launch_time,
    whitelist_launch_time,
    end_time,
    mint_limit,
    max_copies,
    mint_price,
    whitelist_mint_price,
    metadata,
    whitelisted,
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    nft_admin?: string;
    minter_admin?: string;
    beneficiary?: string;
    nft_name?: string;
    nft_symbol: string;
    minter_label?: string;
    nft_label?: string;
    metadata: cw2981.Metadata;
    launch_time?: string;
    whitelist_launch_time?: string;
    end_time?: string;
    mint_limit?: number,
    max_copies?: number,
    mint_price?: Payment,
    whitelist_mint_price?: Payment,
    whitelisted?: string[],
}) => {
    const msg: factory.ExecuteMsg = {
        init_copy_project: {
            beneficiary,
            nft_admin,
            metadata,
            minter_admin,
            minter_label,
            nft_label,
            nft_name,
            nft_symbol,
            end_time,
            launch_time,
            whitelist_launch_time,
            mint_limit,
            max_copies,
            mint_price,
            whitelist_mint_price,
            whitelisted,
        }
    }
    console.log('Minter Admin', minter_admin)
    const result = await client.execute(
        signer,
        contract,
        msg,
        'auto',
    )
    console.log('TX Logs', result.logs[0]);


    // ####################################
    // # Find instantiated Minter address #
    // ####################################
    /// Get all reply logs
    const replyLogs = result.logs[0].events.filter(e=>e.type==='reply').map(e=>e.attributes);

    /// Filter out reply to factory, get only the reply to the minter
    const minterReplyAddressAttributes = replyLogs.filter(e=>e.find(a=>a.key==='_contract_address' && a.value !== contract))
    if (minterReplyAddressAttributes.length > 1) throw 'Unable to find Minter address in logs: Found multiple reply logs'

    const minterAddress = minterReplyAddressAttributes[0].find(a=>a.key==='_contract_address')?.value;
    if (!minterAddress) throw 'Unable to find Minter address in logs'


    // #################################
    // # Find instantiated NFT address #
    // #################################
    /// Get all instantiate logs
    const initLogs = result.logs[0].events.filter(e=>e.type==='instantiate').map(e=>e.attributes);

    /// Filter out Minter init
    const nftInitAttributes = initLogs.filter(e=>e.find(a=>a.key==='_contract_address' && a.value !== minterAddress))
    if (nftInitAttributes.length > 1) throw 'Unable to find NFT address in logs: Found multiple instantiate logs'

    const nftAddress = nftInitAttributes[0].find(a=>a.key==='_contract_address')?.value;;
    if (!nftAddress) throw 'Unable to find NFT address in logs'

    return {minterAddress, nftAddress};
}

export const initRandomProject = async({
    /// SigningCosmWasmClient
    client,
    /// Address signing this transaction.
    signer,
    /// Factory Contract
    contract,
    /// WASM admin of the CW721 contract. Can set rewards address.
    nft_admin = signer,
    /// Recipient of mint payment funds.
    beneficiary = signer,
    /// Admin of the minter. Can preload and change mint settings.
    minter_admin = signer,
    /// Name for the CW721 config
    nft_name,
    /// Symbol for the CW721 config
    nft_symbol,
    /// Label to use when instantiating minter
    minter_label,
    /// Time to open minting to public. Nanosecond epoch.
    launch_time,
    /// Time to open minting to whitelisted addresses. Nanosecond epoch.
    whitelist_launch_time,
    /// Payment config. Native or CW20 supported.
    mint_price,
    wl_mint_price,
    /// Array of whitelisted addresses.
    whitelisted,
    /// Maximum number of mints per address
    mint_limit
}:{
    client: SigningArchwayClient,
    signer: string,
    contract: string,
    nft_admin?: string;
    minter_admin?: string;
    beneficiary: string;
    nft_name: string;
    nft_symbol: string;
    minter_label: string;
    launch_time: string;
    whitelist_launch_time?: string;
    mint_price: Payment,
    wl_mint_price?: Payment,
    whitelisted?: string[],
    mint_limit?: number,
}) => {
    const msg: ExecuteMsg = {
        init_random_project: {
            collection_admin: nft_admin,
            beneficiary,
            reward_admin: nft_admin,

            launch_time,
            whitelist_launch_time,
            mint_price,
            wl_mint_price,
            whitelisted,
            mint_limit,

            contract_name: nft_name,
            nft_symbol,
            label: minter_label,
        }
    }
    console.log(msg)

    const result = await client.execute(
        signer,
        contract,
        msg,
        'auto',
    )
    console.log('TX Logs', result.logs[0]);


    // ####################################
    // # Find instantiated Minter address #
    // ####################################
    /// Get all reply logs
    const replyLogs = result.logs[0].events.filter(e=>e.type==='reply').map(e=>e.attributes);

    /// Filter out reply to factory, get only the reply to the minter
    const minterReplyAddressAttributes = replyLogs.filter(e=>e.find(a=>a.key==='_contract_address' && a.value !== contract))
    if (minterReplyAddressAttributes.length > 1) throw 'Unable to find Minter address in logs: Found multiple reply logs'

    const minterAddress = minterReplyAddressAttributes[0].find(a=>a.key==='_contract_address')?.value;
    if (!minterAddress) throw 'Unable to find Minter address in logs'


    // #################################
    // # Find instantiated NFT address #
    // #################################
    /// Get all instantiate logs
    const initLogs = result.logs[0].events.filter(e=>e.type==='instantiate').map(e=>e.attributes);

    /// Filter out Minter init
    const nftInitAttributes = initLogs.filter(e=>e.find(a=>a.key==='_contract_address' && a.value !== minterAddress))
    if (nftInitAttributes.length > 1) throw 'Unable to find NFT address in logs: Found multiple instantiate logs'

    const nftAddress = nftInitAttributes[0].find(a=>a.key==='_contract_address')?.value;;
    if (!nftAddress) throw 'Unable to find NFT address in logs'


    return {minterAddress, nftAddress};
}