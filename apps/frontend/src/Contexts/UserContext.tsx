import {
  createContext,
  useState,
  useContext,
  ReactElement,
  ReactNode,
  useEffect
} from 'react';
import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { connectKeplrWallet, signLoginPermit } from '../Utils/keplr';
import { toast } from 'react-toastify';
import { checkLogin, getUserProfile, requestNonce, walletLogin } from '../Utils/backend';
import { Coin, Pubkey } from '@cosmjs/amino';
import { Row, Col } from 'react-bootstrap';
import Modal from '../Components/Modal';
import Loader from '../Components/Loader';
import { CREDIT_ADDRESS, denomToHuman, getCreditBalance, getRewards } from '@architech/lib';
import { GetUserProfileResponse } from '@architech/types';

interface Props {
  children: ReactNode;
}

interface User {
  wallet_type: 'Keplr';
  client:  SigningArchwayClient;
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
  user: User | undefined;
  balances: Balances | undefined;
  loadingConnectWallet: boolean
  // authenticated: boolean;
  connectKeplr: (()=>Promise<void>)
  refreshProfile: (()=>Promise<void>)
}

const whatever = async() => {}

// created context with no default values
const UserContext = createContext<UserContextState>({
  loadingConnectWallet: false,
  // authenticated: false,
  balances: undefined,
  connectKeplr: whatever,
  refreshProfile: whatever,
  user: undefined,
});

const KEY = 'KEPLR_CONNECTED_ARCHITECH';

const connectedKeplr = localStorage.getItem(KEY);

export const UserProvider = ({ children }: Props): ReactElement => {
  const [user, setUser] = useState<User>();
  const [loadingConnectWallet, setLoadingConnectWallet] = useState<boolean>(false);
  // const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [waitingForSig, setWaitingForSig] = useState(false);
  const [balances, setBalances] = useState<Balances>();


  // useEffect(()=>{   
  //   if (!wallet && connectedKeplr === 'true') connectKeplr();
  // },[])

  const getBalances = async(client = user?.client, addr = user?.address) => {
    if (!addr || !client) throw new Error('Unable to retrieve balances when wallet is not set.');
    let archErr = undefined;
    let creditErr = undefined;
    let archBalance: Coin | undefined = undefined;
    try {
      archBalance = await client.getBalance(addr, process.env.REACT_APP_NETWORK_DENOM).catch();
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
    try {
      const rewards = await getRewards({
        client: client,
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

  const connectKeplr = async () => {
    try {
      setLoadingConnectWallet(true);
      const { client, address, pubKey } = await connectKeplrWallet();
      getBalances(client, address)

      /* eslint-disable */
      // if (confirm(`Sign permit to authenticate wallet?\nThis is required to take advanted of profile features.`)){
      
      // Check if already logged in
      // TODO handle error
      try {
        const response = await checkLogin(address);
        const newUser: User = {client, address, pubKey, wallet_type: 'Keplr', profile: response}
        setUser(newUser)
        localStorage.setItem(KEY, 'true');
        return;
      } catch (err: any){ }
      try {
        const nonceResponse = await requestNonce(address, pubKey)

        setWaitingForSig(true);
        const signResult = await signLoginPermit(nonceResponse.nonce, address)
        setWaitingForSig(false);


        const loginResult = await walletLogin(JSON.stringify(signResult.pub_key), signResult.signature)
        // setAuthenticated(true);
        const newUser: User = {client, address, pubKey, wallet_type: 'Keplr', profile: loginResult}

        setUser(newUser)
        localStorage.setItem(KEY, 'true');
      }catch(err: any){
        toast.error(err.message);
      } finally {
        setWaitingForSig(false);
      }
    } catch(err: any){
      switch(err.message){
        case 'Keplr Wallet not found':
          toast.error('Keplr Wallet was not found. Ensure it is enabled and unlocked.')
          break;
        default:
          toast.error(err.message)
          break;
      }
    }
    setLoadingConnectWallet(false);
  }

  const refreshProfile = async() => {
    if (!user) throw 'Unable to refresh profile when user is not set.'
    const newProfile = await getUserProfile(user?.address);
    const newUser: User = {...user, profile: newProfile}
    setUser(newUser)
  }

  const values = {
    user,
    balances,
    loadingConnectWallet,
    // authenticated,
    connectKeplr,
    refreshProfile
  };

  // add values to provider to reach them out from another component
  return <UserContext.Provider value={values}>
          <Modal open={waitingForSig} locked={true} onClose={()=>{}} >
            <Row className="px-4 pt-4">
              <Col style={{textAlign: 'center'}}>
                Please sign the permit with your wallet.<br />
                <Loader />
              </Col>
            </Row>
        </Modal>
    {children}</UserContext.Provider>;
};

// created custom hook
export const useUser = (): UserContextState => useContext(UserContext);
