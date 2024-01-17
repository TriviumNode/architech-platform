import {
  createContext,
  useState,
  useContext,
  ReactElement,
  ReactNode,
  useEffect,
  useRef
} from 'react';
import { ArchwayClient, SigningArchwayClient } from '@archwayhq/arch3.js';
import { connectKeplrWallet, getAbstraxionPubKey, signLoginPermit, signLoginPermit2, signLoginPermit3 } from '../Utils/keplr';
import { toast } from 'react-toastify';
import { checkLogin, getUserProfile, requestNonce, walletLogin } from '../Utils/backend';
import { Coin, Pubkey } from '@cosmjs/amino';
import { Row, Col } from 'react-bootstrap';
import Loader from '../Components/Loader';
import { denomToHuman, getCreditBalance, getRewards, parseError } from '@architech/lib';
import { GetUserProfileResponse } from '@architech/types';
import { CREDIT_ADDRESS, DISABLED_FEATURES } from '../Utils/queryClient';
import ModalV2 from '../Components/ModalV2';

import styles from './WalletModal.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { Keplr } from '@keplr-wallet/types';
import { Abstraxion, useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { toBase64, fromBase64 } from '@cosmjs/encoding'
import { Type, Field } from "protobufjs";
import { GasPrice } from '@cosmjs/stargate'

interface Props {
  children: ReactNode;
}

export interface CurrentWallet {
  wallet_type: 'Keplr' | 'Abstraxion';
  key_name: string;
  client:  SigningArchwayClient | SigningCosmWasmClient;
  address: string;
  pubKey: Pubkey;
  profile: GetUserProfileResponse;
}

interface Balances {
  arch?: number;
  arch_err?: string;
  credits?: number;
  credits_err?: string;
  rewards?: number;
  rewards_records?: number;
}

export interface UserContextState {
  user: CurrentWallet | undefined;
  balances: Balances | undefined;
  walletStatus: STATUS;
  connectWallet: (()=>void)
  refreshProfile: (()=>Promise<void>)
  devMode: boolean;
  toggleDevMode: ()=>void;
  refreshBalances: ()=>void;
}

const whatever = async() => {}

// created context with no default values
const UserContext = createContext<UserContextState>({
  walletStatus: 'DISCONNECTED',
  balances: undefined,
  connectWallet: whatever,
  refreshProfile: whatever,
  toggleDevMode: whatever,
  refreshBalances: whatever,
  user: undefined,
  devMode: false,
});

const KEY = 'KEPLR_CONNECTED_ARCHITECH';

const connectedKeplr = localStorage.getItem(KEY);

type STATUS = 'DISCONNECTED' | 'SELECT' | 'SWITCH' | 'LOADING_CONNECT' | 'LOADING_NONCE' | 'LOADING_SIG' | 'LOADING_LOGIN' | 'CONNECTED' | 'ERROR'

export const UserProvider = ({ children }: Props): ReactElement => {
  const [user, setUser] = useState<CurrentWallet>();
  const [balances, setBalances] = useState<Balances>();
  const [walletStatus, setWalletStatus] = useState<STATUS>('DISCONNECTED');
  const [devMode, setDevMode] = useState(false);
  const [showXion, setShowXion] = useState(false);

  const { data, isConnected, isConnecting, isReconnecting } = useAbstraxionAccount();
  const {client: _abstraxionClient} = useAbstraxionSigningClient() as {client?: SigningCosmWasmClient}
  const abstraxionClientRef = useRef(_abstraxionClient);
  abstraxionClientRef.current = _abstraxionClient;
  const abstraxionClient = abstraxionClientRef.current;

  useEffect(()=>{
    if (isConnected && !!abstraxionClient) {
      console.log('Abstraxion wallet connected!!')
      connectAbstraxion()
    } else {
      console.log('Abstraxion disconnected :(')
    }
  },[isConnected, _abstraxionClient])

  window.addEventListener("keplr_keystorechange", () => {
    console.log("Keplr wallet changed!");
    onChangeWallet();
  })

  window.addEventListener("leap_keystorechange", () => {
    console.log("Leap wallet changed!");
    onChangeWallet();
  })

  window.addEventListener("cosmostation_keystorechange", () => {
    console.log("Cosmostation wallet changed!");
    onChangeWallet();
  })

  const onChangeWallet = async () => {
    if (!user) {
      // connectWallet()
      return;
    }
    if (!window.wallet) throw new Error('window.wallet was not defined.')

    const keyResult = await window.wallet.getKey(process.env.REACT_APP_CHAIN_ID)
    console.log('New Address', keyResult.bech32Address)
    console.log('Current Address', user.address);

    if (keyResult.bech32Address === user.address) {
      // Hide modal if switching back to previous wallet
      setWalletStatus('CONNECTED')
    } else {
      // Display modal
      setWalletStatus('SWITCH')
    }
  }

  const toggleDevMode = () => {
    setDevMode(!devMode);
  }

  const handleChangeWallet = async () => {
    try {
      setUser(undefined);
      setBalances(undefined);
      setWalletStatus('DISCONNECTED')

      if (!window.wallet) connectWallet();
      else await connectKeplr(window.wallet);
    } catch(error) {
      toast.error('Failed to change wallets')
      console.error('Failed to change wallets:', error)
      setWalletStatus('DISCONNECTED')
    }
  }

  const refreshBalances = () => {
    if (!user) return
    getBalances(user.client, user.address)
  }

  const getBalances = async(client = user?.client, addr = user?.address) => {
    if (!addr || !client) throw new Error('Unable to retrieve balances when wallet is not set.');
    let archErr = undefined;
    let creditErr = undefined;
    let archBalance: Coin | undefined = undefined;
    try {
      archBalance = await client.getBalance(addr, process.env.REACT_APP_NETWORK_DENOM);
    } catch(err:any) {
      console.error('Error fetching arch balance.', err)
      archErr = err.toString();
    }
    
    let creditBalance: string | undefined = undefined;
    try {
      creditBalance = await getCreditBalance({
        client: client,
        address: addr,
        creditContract: CREDIT_ADDRESS,
      })
    } catch(err:any) {
      console.error('Error fetching credit balance.', err)
      creditErr = err.toString();
    }

    let rewardsBalance: string | undefined = undefined;
    let rewards_records: number | undefined = undefined;
    if (!DISABLED_FEATURES.includes('ARCH_REWARDS')) {
      try {
        const rewards = await getRewards({
          client: client as SigningArchwayClient,
          address: addr,
        });
        if (rewards) {
          rewardsBalance = rewards.totalRewards.find(c=>c.denom === process.env.REACT_APP_NETWORK_DENOM)?.amount
          rewards_records = rewards.totalRecords;
        }
      } catch(err:any) {
        console.error('Error fetching credit balance.', err)
        creditErr = err.toString();
      }
    }

    setBalances({
      // arch: archBalance ? parseInt(archBalance.amount) / Math.pow(10, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)) : undefined,
      arch: archBalance ? denomToHuman(archBalance.amount, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)) : undefined,
      credits: creditBalance ? parseInt(creditBalance) : undefined,
      rewards: rewardsBalance ? denomToHuman(rewardsBalance, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)) : undefined,
      arch_err: archErr,
      credits_err: creditErr,
      rewards_records,
    })

  }

  const connectWallet = () => {
    if (process.env.REACT_APP_CHAIN_ID.includes('xion')) {
      setShowXion(true);
    } else {
      setWalletStatus('SELECT')
    }
  }

  const connectAbstraxion = async () => {
    try {
      setWalletStatus('LOADING_CONNECT');

      if (!data || !isConnected) throw 'Abstraxion wallet is not connected!'
      const { bech32Address: address, name, pubKey: _pubKey, algo } = data;
      console.log('useAbstraxionAccount.data', data)


      if (!abstraxionClient) throw 'Unable to fetch Abstraxion signer';
      console.log('abstraxionClient', abstraxionClient)

      // Add custom protobuf for arbitrary signature
      const MsgSignData = new Type("MsgSignData")
        .add(new Field("signer", 1, "string"))
        .add(new Field("data", 2, "string"))
      abstraxionClient.registry.register('sign/MsgSignData', MsgSignData)

      // Ensure we have the pubkey, abstracted accounts don't provide it yet
      let pubKey: Uint8Array | undefined = _pubKey;
      let stdPubKey: Pubkey | undefined;
      if (!pubKey) {
        console.log('Getting PubKey!!')
        const _stdPubKey = await getAbstraxionPubKey(abstraxionClient, address)
        console.log('Getting PubKey OK')
        if (!_stdPubKey) throw 'Unable to determine Abstraxion wallet pubKey from signature';

        stdPubKey = _stdPubKey
        pubKey = _stdPubKey.value as Uint8Array
      } else {
        // It's actually a fucking keyed object now
        console.log('Non Abstraxion PUBKEY raw', pubKey)
        const pubKeyAry = Uint8Array.from(Object.keys(pubKey).map((k: any)=>(pubKey as Uint8Array)[k]))
        stdPubKey = {
          type: 'tendermint/PubKeySecp256k1', //hopefully Keplr is always this
          value: toBase64(pubKeyAry)
        }  
      }

      console.log('Final stdPubKey', stdPubKey);
      if (!pubKey) throw 'Unable to fetch Abstraxion pubKey';


      // # Set default gas price on client #
      const gasPrice = GasPrice.fromString('0uxion');
      //@ts-ignore fuck your "private"
      abstraxionClient.gasPrice = gasPrice;

      if (window.keplr){
        window.keplr.defaultOptions = {
          sign: {
            preferNoSetFee: true,
          }
        }
      }

      // Get token and credit balances async
      getBalances(abstraxionClient, address)    

      // Check if already logged in
      // TODO handle error
      setWalletStatus('LOADING_NONCE');
      try {
        const response = await checkLogin(address);
        const newUser: CurrentWallet = {client: abstraxionClient, address, pubKey: stdPubKey, wallet_type: 'Abstraxion', profile: response, key_name: name || 'Abstraxion Account'}
        setUser(newUser)
        setWalletStatus('CONNECTED');
        localStorage.setItem(KEY, 'true');
        return;
      } catch (err: any){ }

      // Try Login with Architech if not already logged in
      try {
        const nonceResponse = await requestNonce(address, stdPubKey)

        setWalletStatus('LOADING_SIG');
        const {signature} = await signLoginPermit3(abstraxionClient, address, nonceResponse.nonce)

        setWalletStatus('LOADING_LOGIN');
        const loginResult = await walletLogin(JSON.stringify(stdPubKey), signature)
        // setAuthenticated(true);

        //@ts-ignore
        const newUser: CurrentWallet = {client: abstraxionClient, address, pubKey: stdPubKey, wallet_type: 'Abstraxion', profile: loginResult, key_name: name || 'Abstraxion Account'}

        setUser(newUser)
        localStorage.setItem(KEY, 'true');
        setWalletStatus('CONNECTED');

      }catch(err: any){
        console.error(err);
        toast.error(parseError(err)); 
        setWalletStatus('DISCONNECTED');
      }

    } catch (err: any) {
      setWalletStatus('DISCONNECTED');
      console.error(err);
      toast.error(err.toString())
    }
  }

  const connectKeplr = async (wallet: any) => {
    window.wallet = wallet;

    if (window.keplr){
      window.keplr.defaultOptions = {
        sign: {
          preferNoSetFee: true,
        }
      }
    }
    if (window.cosmostation){
      window.cosmostation.providers.keplr.defaultOptions = {
        sign: {
          preferNoSetFee: true,
        },
      };
    }
    try {
      setWalletStatus('LOADING_CONNECT');
      const { client, address, pubKey, keyName } = await connectKeplrWallet();
      getBalances(client, address)

      /* eslint-disable */
      // if (confirm(`Sign permit to authenticate wallet?\nThis is required to take advanted of profile features.`)){
      
      // Check if already logged in
      // TODO handle error
      setWalletStatus('LOADING_NONCE');
      try {
        const response = await checkLogin(address);
        const newUser: CurrentWallet = {client, address, pubKey, wallet_type: 'Keplr', profile: response, key_name: keyName}
        setUser(newUser)
        setWalletStatus('CONNECTED');
        localStorage.setItem(KEY, 'true');
        return;
      } catch (err: any){ }

      // Try Login with Architech
      try {
        const nonceResponse = await requestNonce(address, pubKey)

        setWalletStatus('LOADING_SIG');
        const signResult = await signLoginPermit(nonceResponse.nonce, address)
        setWalletStatus('LOADING_LOGIN');


        const loginResult = await walletLogin(JSON.stringify(signResult.pub_key), signResult.signature)
        // setAuthenticated(true);
        const newUser: CurrentWallet = {client, address, pubKey, wallet_type: 'Keplr', profile: loginResult, key_name: keyName}

        setUser(newUser)
        localStorage.setItem(KEY, 'true');
        setWalletStatus('CONNECTED');

      }catch(err: any){
        toast.error(parseError(err)); 
        setWalletStatus('DISCONNECTED');
      }
    } catch(err: any){
      switch(err.message){
        case 'Keplr Wallet not found':
          toast.error('Keplr Wallet was not found. Ensure it is enabled and unlocked.')
          break;
        default:
          console.error('Error connecting wallet: ', err)
          if (err.message.includes('NetworkError when attempting to fetch resource.'))
            toast.error(`Error connecting wallet: Failed to query chain`)
          else toast.error(`Error connecting wallet: ${err.message}`)
          break;
      }
    }
    setWalletStatus('DISCONNECTED');
  }

  const refreshProfile = async() => {
    if (!user) throw 'Unable to refresh profile when user is not set.'
    refreshBalances();
    const newProfile = await getUserProfile(user?.address);
    const newUser: CurrentWallet = {...user, profile: newProfile}
    setUser(newUser);
  }

  const values: UserContextState = {
    user,
    balances,
    walletStatus,
    connectWallet,
    refreshProfile,
    devMode,
    toggleDevMode,
    refreshBalances,
  };

  const LoadingModal = ({msg}: {msg: string}) =>
    <Row className="px-4 pt-4">
      <Col style={{textAlign: 'center'}}>
        {msg}<br />
        <Loader />
      </Col>
    </Row>

  const modalContent = () => {
    switch(walletStatus){
      case 'SELECT':
        return (
          <div className={styles.selectWalletContainer}>
            {getWalletList().map(w=>
              <Col className={styles.walletTile} key={w.name}>
                <button onClick={()=>connectKeplr(w.provider)} disabled={!!!w.provider}>
                  <div>
                    <img src={`/images/wallets/${w.name.toLowerCase()}.svg`} />
                    <div>
                      <h2>{w.name}</h2>
                    </div>
                  </div>
                  { w.mobile && <FontAwesomeIcon icon={faMobileScreenButton} size={'2x'} /> }
                </button>
                {/* { typeof w.provider === "undefined" ? */}
                { !!!w.provider ?
                  <a href={w.link} target='_blank' rel='noreferrer noopener'>Get {w.name} Wallet</a> : <div style={{height: '1em'}} />
                }
              </Col>  
            )}
            {/* <Col className={styles.walletTile}>
              <button onClick={()=>connectKeplr(window.keplr)} disabled={typeof window.keplr === "undefined"}>
                <div>
                  <img src='/images/wallets/keplr.png' />
                  <div>
                    <h2>Keplr</h2>
                  </div>
                </div>
              </button>
              { typeof window.keplr === "undefined" ?
                <a href='https://www.keplr.app/download' target='_blank' rel='noreferrer noopener'>Get Keplr Wallet</a> : <div style={{height: '1em'}} />
              }
            </Col>

            <Col className={styles.walletTile}>
              <button onClick={()=>connectKeplr(window.archx)} disabled={typeof window.archx === "undefined"}>
                <div>
                  <img src='/images/wallets/archx.svg' />
                  <div>
                    <h2>ArchX</h2>
                  </div>
                </div>
                <FontAwesomeIcon icon={faMobileScreenButton} size={'2x'} />
              </button>
              { typeof window.archx === "undefined" ?
                <a href='https://archx.io' target='_blank' rel='noreferrer noopener'>Get ArchX Wallet</a> : <div style={{height: '1em'}} />
              }
            </Col>
            <Col className={styles.walletTile}>
              <button onClick={()=>connectKeplr(window.leap)} disabled={typeof window.leap === "undefined"}>
                <div>
                  <img src='/images/wallets/leap.svg' />
                  <div>
                    <h2>Leap</h2>
                  </div>
                </div>
                <FontAwesomeIcon icon={faMobileScreenButton} size={'2x'} />
              </button>
              { typeof window.leap === "undefined" ?
                <a href='https://www.leapwallet.io/download' target='_blank' rel='noreferrer noopener'>Get Leap Wallet</a> : <div style={{height: '1em'}} />
              }
            </Col>

            <Col className={styles.walletTile}>
              <button onClick={()=>connectKeplr(window.cosmostation.providers.keplr)} disabled={typeof window.cosmostation === "undefined"}>
                <div>
                  <img src='/images/wallets/cosmostation.svg' />
                  <div>
                    <h2>Cosmostation</h2>
                  </div>
                </div>
              </button>
              { typeof window.cosmostation === "undefined" ?
                <a href='https://cosmostation.io/products/cosmostation_extension' target='_blank' rel='noreferrer noopener'>Get Cosmostation Wallet</a> : <div style={{height: '1em'}} />
              }
            </Col> */}
          </div>
        )
      case 'LOADING_SIG':
        return (
          <LoadingModal msg='Please sign the permit with your wallet' />
        )
      case 'LOADING_CONNECT':
        return (
          <LoadingModal msg='Please allow the connection with your wallet' />
        )
      case 'LOADING_NONCE':
        return (
          <LoadingModal msg='Preparing to authenticate with Architech' />
        )
      case 'LOADING_LOGIN':
        return (
          <LoadingModal msg='Authenticating your wallet with Architech' />
        )
      case 'SWITCH':
        return (
          <div className={styles.selectWalletContainer} style={{textAlign: 'center'}}>
            {/* <h5>Wallet Changed</h5> */}
            <p>Looks like you changed wallets. To login using the new wallet, click the button below.<br/>Any unsaved changes will be lost.</p>
            <button type='button' onClick={()=>handleChangeWallet()}>Continue with New Wallet</button>
          </div>
        )
    }
  }

  // add values to provider to reach them out from another component
  return (
    <UserContext.Provider value={values}>
      <ModalV2
        open={!process.env.REACT_APP_CHAIN_ID.includes('xion') && (walletStatus !== 'CONNECTED' && walletStatus !== 'DISCONNECTED') }
        onClose={()=>setWalletStatus('DISCONNECTED')}
        title={walletStatus === 'SWITCH' ? 'Change Wallet' : 'Connect Wallet'}
        style={{maxWidth: '400px'}}
        locked={true}
      >
        {modalContent()}
      </ModalV2>
      <Abstraxion
        onClose={()=>setShowXion(false)}
        isOpen={showXion}
      />
      {children}
    </UserContext.Provider>
  );
};

// created custom hook
export const useUser = (): UserContextState => useContext(UserContext);

type WalletConfig = {
  name: string;
  provider: Keplr | undefined;
  link: string;
  mobile: boolean;
}

const keplrConfig: WalletConfig = {
  name: 'Keplr',
  provider: window.keplr,
  link: 'https://www.keplr.app/download',
  mobile: false,
};

// const archxConfig: WalletConfig = {
//   name: 'ArchX',
//   provider: window.archx,
//   link: 'https://archx.io',
//   mobile: true,
// };

const leapConfig: WalletConfig = {
  name: 'Leap',
  provider: window.leap,
  link: 'https://www.leapwallet.io/download',
  mobile: true,
};

const cosmostationConfig: WalletConfig = {
  name: 'Cosmostation',
  provider: window.cosmostation?.providers?.keplr,
  link: 'https://cosmostation.io/products/cosmostation_extension',
  mobile: false,
};

const getWalletList = () => {
  const wallets: WalletConfig[] = [];

  // // Show installed wallets first
  //if (window.archx) wallets.push(archxConfig);
  if (window.keplr) {
    console.log('Found Keplr Wallet')
    keplrConfig.provider = window.keplr
    wallets.push(keplrConfig);
  }
  if (window.leap) {
    console.log('Found Leap Wallet')
    leapConfig.provider = window.leap
    wallets.push(leapConfig);
  }
  if (window.cosmostation) {
    console.log('Found Cosmostation Wallet')
    cosmostationConfig.provider = window.cosmostation.providers.keplr
    wallets.push(cosmostationConfig);
  }


  // Show other wallets after installed wallets
  if (!wallets.find(w=>w.name === keplrConfig.name)) wallets.push(keplrConfig);
  // if (!wallets.find(w=>w.name === archxConfig.name)) wallets.push(archxConfig);
  if (!wallets.find(w=>w.name === leapConfig.name)) wallets.push(leapConfig);
  if (!wallets.find(w=>w.name === cosmostationConfig.name)) wallets.push(cosmostationConfig);

  return wallets;
}
