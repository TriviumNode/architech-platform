import sleep from './sleep';
import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { Pubkey } from '@cosmjs/amino/build/pubkeys';
import { toBase64 } from '@cosmjs/encoding'

export const connectKeplrWallet = async(): Promise<{
    client: SigningArchwayClient;
    address: string;
    pubKey: Pubkey;
}> => {
    if (!window.keplr) {
        sleep(1_500)
    }
    if (!window.keplr) {
        throw new Error('Keplr Wallet not found')
    }

    await window.keplr.experimentalSuggestChain({
        chainId: "localnet",
        chainName: "Archway Local",
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
                coinDenom: "STAKE", 
                coinMinimalDenom: "stake", 
                coinDecimals: 6, 
            }, 
        ],
        feeCurrencies: [
            {
                coinDenom: "STAKE",
                coinMinimalDenom: "stake",
                coinDecimals: 6,
                // gasPriceStep: {
                //     low: 0.00,
                //     average: 0.00,
                //     high: 0.01,
                // },
            },
        ],
        stakeCurrency: {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 6,
        },
        gasPriceStep: {
            low: 0.00,
            average: 0.00,
            high: 0.01,
        },
    });
    await window.keplr.enable(process.env.REACT_APP_CHAIN_ID);

    const keyResult = await window.keplr.getKey(process.env.REACT_APP_CHAIN_ID)

    const offlineSigner = window.keplr.getOfflineSigner(process.env.REACT_APP_CHAIN_ID);
    const accounts = await offlineSigner.getAccounts();

    const client = await SigningArchwayClient.connectWithSigner(process.env.REACT_APP_RPC_URL, offlineSigner, {  prefix: process.env.REACT_APP_NETWORK_PREFIX });

    const stdPubKey: Pubkey = {
        type: 'tendermint/PubKeySecp256k1', //hopefully Keplr is always this
        value: toBase64(accounts[0].pubkey)
    }

    return {client, address: accounts[0].address, pubKey: stdPubKey}
}

export const signLoginPermit = async(nonce: string, signerAddress: string) => {
    if (!window.keplr) {
        sleep(1_500)
    }
    if (!window.keplr) {
        throw new Error('Keplr Wallet not found')
    }
    const loginString = `Login to Architech\n${nonce}`
    const { pub_key, signature } = await window.keplr.signArbitrary(process.env.REACT_APP_CHAIN_ID, signerAddress, loginString)
    return { pub_key, signature };
}