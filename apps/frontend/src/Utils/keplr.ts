import sleep from './sleep';
import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { Pubkey } from '@cosmjs/amino/build/pubkeys';
import { toBase64 } from '@cosmjs/encoding'
import type { OfflineSigner } from '@cosmjs/proto-signing'

export const connectKeplrWallet = async(): Promise<{
    client: SigningArchwayClient;
    address: string;
    pubKey: Pubkey;
    keyName: string;
}> => {
    if (!window.wallet) {
        sleep(1_500)
    }
    if (!window.wallet) {
        throw new Error('Keplr Wallet not found')
    }

    await window.wallet.experimentalSuggestChain({
        chainId: process.env.REACT_APP_CHAIN_ID,
        chainName: `Archway ${process.env.REACT_APP_CHAIN_ID}`,
        rpc: process.env.REACT_APP_RPC_URL,
        rest: process.env.REACT_APP_REST_URL,
        bip44: {
            coinType: 118,
        },
        bech32Config: {
            bech32PrefixAccAddr: "archway",
            bech32PrefixAccPub: "archway" + "pub",
            bech32PrefixValAddr: "archway" + "valoper",
            bech32PrefixValPub: "archway" + "valoperpub",
            bech32PrefixConsAddr: "archway" + "valcons",
            bech32PrefixConsPub: "archway" + "valconspub",
        },
        currencies: [ 
            { 
                coinDenom: process.env.REACT_APP_NETWORK_DENOM, 
                coinMinimalDenom: process.env.REACT_APP_NETWORK_DENOM, 
                coinDecimals: parseInt(process.env.REACT_APP_NETWORK_DECIMALS), 
            }, 
        ],
        feeCurrencies: [
            {
                coinDenom: process.env.REACT_APP_NETWORK_DENOM, 
                coinMinimalDenom: process.env.REACT_APP_NETWORK_DENOM, 
                coinDecimals: parseInt(process.env.REACT_APP_NETWORK_DECIMALS), 
                // gasPriceStep: {
                //     low: 0.00,
                //     average: 0.00,
                //     high: 0.01,
                // },
            },
        ],
        stakeCurrency: {
            coinDenom: process.env.REACT_APP_NETWORK_DENOM, 
            coinMinimalDenom: process.env.REACT_APP_NETWORK_DENOM, 
            coinDecimals: parseInt(process.env.REACT_APP_NETWORK_DECIMALS), 
        },
        gasPriceStep: {
            low: 140000000000,
            average: 140000000000,
            high: 140000000000,
        },
    });
    await window.wallet.enable(process.env.REACT_APP_CHAIN_ID);

    const {name: keyName} = await window.wallet.getKey(process.env.REACT_APP_CHAIN_ID)
    
    const offlineSigner = await window.wallet.getOfflineSignerAuto(process.env.REACT_APP_CHAIN_ID);
    const accounts = await offlineSigner.getAccounts();

    const client = await SigningArchwayClient.connectWithSigner(process.env.REACT_APP_RPC_URL, offlineSigner as OfflineSigner);

    const stdPubKey: Pubkey = {
        type: 'tendermint/PubKeySecp256k1', //hopefully Keplr is always this
        value: toBase64(accounts[0].pubkey)
    }

    return {client, address: accounts[0].address, pubKey: stdPubKey, keyName}
}

export const signLoginPermit = async(nonce: string, signerAddress: string) => {
    if (!window.wallet) {
        sleep(1_500)
    }
    if (!window.wallet) {
        throw new Error('Keplr Wallet not found')
    }
    const loginString = `Login to Architech\n${nonce}`
    const { pub_key, signature } = await window.wallet.signArbitrary(process.env.REACT_APP_CHAIN_ID, signerAddress, loginString)
    return { pub_key, signature };
}