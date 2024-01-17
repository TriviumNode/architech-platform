import sleep from './sleep';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Pubkey } from '@cosmjs/amino/build/pubkeys';
import { toBase64, fromBase64 } from '@cosmjs/encoding'
import { AminoSignResponse } from '@cosmjs/amino';
import { AuthInfo } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export const connectKeplrWallet = async(): Promise<{
    client: SigningCosmWasmClient;
    address: string;
    pubKey: Pubkey;
    keyName: string;
}> => {
    console.log('Connecting Keplr Wallet!!')
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
            bech32PrefixAccAddr: process.env.REACT_APP_NETWORK_PREFIX,
            bech32PrefixAccPub: process.env.REACT_APP_NETWORK_PREFIX + "pub",
            bech32PrefixValAddr: process.env.REACT_APP_NETWORK_PREFIX + "valoper",
            bech32PrefixValPub: process.env.REACT_APP_NETWORK_PREFIX + "valoperpub",
            bech32PrefixConsAddr: process.env.REACT_APP_NETWORK_PREFIX + "valcons",
            bech32PrefixConsPub: process.env.REACT_APP_NETWORK_PREFIX + "valconspub",
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
            low: 900000000000,
            average: 900000000000,
            high: 900000000000,
        },
    });
    await window.wallet.enable(process.env.REACT_APP_CHAIN_ID);

    const {name: keyName} = await window.wallet.getKey(process.env.REACT_APP_CHAIN_ID)
    
    const offlineSigner = await window.wallet.getOfflineSignerAuto(process.env.REACT_APP_CHAIN_ID);
    const accounts = await offlineSigner.getAccounts();

    const client = await SigningCosmWasmClient.connectWithSigner(process.env.REACT_APP_RPC_URL, offlineSigner);

    const stdPubKey: Pubkey = {
        type: 'tendermint/PubKeySecp256k1', //hopefully Keplr is always this
        value: toBase64(accounts[0].pubkey)
    }

    return {client, address: accounts[0].address, pubKey: stdPubKey, keyName}
}

export const signLoginPermit3 = async(client: SigningCosmWasmClient, signerAddress: string, nonce: string) => {
  const loginString = `Login to Architech\n${nonce}`

  const arbMessage = {
    typeUrl: 'sign/MsgSignData',
    value: {
      signer: signerAddress,
      data: loginString,
    },
  };

  const {authInfoBytes, bodyBytes, signatures} = await client.sign(signerAddress, [], {gas: '0', amount: [{amount: '0', denom: process.env.REACT_APP_NETWORK_DENOM}]}, '', { accountNumber: 0, sequence: 0, chainId: process.env.REACT_APP_CHAIN_ID })
  const signature = Buffer.from(signatures[0]).toString('base64')

  const {signerInfos} = AuthInfo.decode(authInfoBytes);

  return { signature, pubKey: signerInfos[0].publicKey as unknown };
}

export const signLoginPermit2 = async(client: SigningCosmWasmClient, signerAddress: string, nonce: string) => {
  if (window.keplr) {
    await window.keplr.experimentalSuggestChain({
      chainId: process.env.REACT_APP_CHAIN_ID,
      chainName: `Xion ${process.env.REACT_APP_CHAIN_ID}`,
      rpc: process.env.REACT_APP_RPC_URL,
      rest: process.env.REACT_APP_REST_URL,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: process.env.REACT_APP_NETWORK_PREFIX,
        bech32PrefixAccPub: process.env.REACT_APP_NETWORK_PREFIX + "pub",
        bech32PrefixValAddr: process.env.REACT_APP_NETWORK_PREFIX + "valoper",
        bech32PrefixValPub: process.env.REACT_APP_NETWORK_PREFIX + "valoperpub",
        bech32PrefixConsAddr: process.env.REACT_APP_NETWORK_PREFIX + "valcons",
        bech32PrefixConsPub: process.env.REACT_APP_NETWORK_PREFIX + "valconspub",
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
        },
      ],
      stakeCurrency: {
        coinDenom: process.env.REACT_APP_NETWORK_DENOM, 
        coinMinimalDenom: process.env.REACT_APP_NETWORK_DENOM, 
        coinDecimals: parseInt(process.env.REACT_APP_NETWORK_DECIMALS), 
      },
      gasPriceStep: {
        low: 900000000000,
        average: 900000000000,
        high: 900000000000,
      },
    });
    await window.keplr.enable(process.env.REACT_APP_CHAIN_ID);
  }

  const loginString = `Login to Architech\n${nonce}`

  //@ts-ignore fuck off
  const { pub_key, signature } = await client.signer.keplr.signArbitrary(process.env.REACT_APP_CHAIN_ID, signerAddress, loginString)
  return { pub_key, signature };
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

export const getAbstraxionPubKey = async (client: SigningCosmWasmClient, signerAddress: string): Promise<Pubkey> => {
  const { pubKey } = await signLoginPermit3(client, signerAddress, 'Test') as any;
  console.log('TESTPUBKEY', pubKey)
  console.log('Abstraxion PUBKEY raw', pubKey.value)

  const stdPubKey: Pubkey = {
    type: pubKey.typeUrl, 
    value: toBase64(pubKey.value)
  }

  return stdPubKey;
}