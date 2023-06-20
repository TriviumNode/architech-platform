import {
  createContext,
  useState,
  useContext,
  ReactElement,
  ReactNode,
  useEffect
} from 'react';
import { SigningArchwayClient } from '@archwayhq/arch3.js/build';
import { connectKeplrWallet, signLoginPermit } from '../Utils/keplr';
import { toast } from 'react-toastify';
import { requestNonce, walletLogin } from '../Utils/backend';
import { Pubkey } from '@cosmjs/amino';
import { Row, Col } from 'react-bootstrap';
import Modal from '../Components/Modal';
import Loader from '../Components/Loader';
import { CREDIT_ADDRESS, getCreditBalance } from '@architech/lib';
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
  credits?: number;
}

export interface UserContextState {
  user: User | undefined;
  balances: Balances | undefined;
  loadingConnectWallet: boolean
  authenticated: boolean;
  connectKeplr: undefined | (()=>Promise<void>)
}

// created context with no default values
const UserContext = createContext<UserContextState>({
  loadingConnectWallet: false,
  authenticated: false,
  balances: undefined,
  connectKeplr: undefined,
  user: undefined,
});

const KEY = 'KEPLR_CONNECTED_ARCHITECH';

const connectedKeplr = localStorage.getItem(KEY);

export const UserProvider = ({ children }: Props): ReactElement => {
  const [user, setUser] = useState<User>();
  const [loadingConnectWallet, setLoadingConnectWallet] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [waitingForSig, setWaitingForSig] = useState(false);
  const [balances, setBalances] = useState<Balances>();


  // useEffect(()=>{   
  //   console.log('EFFECT')
  //   if (!wallet && connectedKeplr === 'true') connectKeplr();
  // },[])

  const getBalances = async(client = user?.client, addr = user?.address) => {
    if (!addr || !client) throw new Error('Unable to retrieve balances when wallet is not set.');
    const archBalance = await client.getBalance(addr, process.env.REACT_APP_NETWORK_DENOM).catch();
    const creditBalance = await getCreditBalance({
      client: client,
      address: addr,
      creditContract: CREDIT_ADDRESS,
    }).catch();
    setBalances({
      arch: parseInt(archBalance.amount) / Math.pow(10, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)),
      credits: parseInt(creditBalance),
    })

  }

  const connectKeplr = async () => {
    try {
      setLoadingConnectWallet(true);
      const { client, address, pubKey } = await connectKeplrWallet();
      getBalances(client, address)

      /* eslint-disable */
      // if (confirm(`Sign permit to authenticate wallet?\nThis is required to take advanted of profile features.`)){
        try {
          const nonceResponse = await requestNonce(address, pubKey)
          console.log(nonceResponse)

          setWaitingForSig(true);
          const signResult = await signLoginPermit(nonceResponse.nonce, address)
          setWaitingForSig(false);


          const loginResult = await walletLogin(JSON.stringify(signResult.pub_key), signResult.signature)
          console.log(loginResult);
          setAuthenticated(true);
          const newUser: User = {client, address, pubKey, wallet_type: 'Keplr', profile: loginResult}

          setUser(newUser)
          localStorage.setItem(KEY, 'true');
        }catch(err: any){
          toast.error(err.message);
        } finally {
          setWaitingForSig(false);
        }
        
        
      // }

      
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

  const values = {
    user,
    balances,
    loadingConnectWallet,
    authenticated,
    connectKeplr
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
