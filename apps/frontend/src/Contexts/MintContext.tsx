import { truncateAddress } from '@architech/lib';
import {
  createContext,
  useState,
  useContext,
  ReactElement,
  ReactNode,
  useEffect,
  useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Id, toast } from 'react-toastify';
import { useUser } from './UserContext';

interface Props {
  children: ReactNode;
}

type PendingMint = {
  collectionContract: string;
  collectionName: string;
  minterContract: string;
}

export interface MintContextState {
  pendingMints: PendingMint[];
  waitForMint: ((newMint: PendingMint)=>void)
}

const undefinedFunc = async() => {}

const MintContext = createContext<MintContextState>({
  pendingMints: [],
  waitForMint: undefinedFunc,
});

const WS_URL = `${process.env.REACT_APP_RPC_URL.replace(/\/$/, '').replace('https', 'wss').replace('http', 'ws')}/websocket`;
export const MintProvider = ({ children }: Props): ReactElement => {
  const { user, refreshProfile } = useUser()
  const [ws, setWs] = useState<WebSocket>();
  const [pendingMints, setPendingMints] = useState<PendingMint[]>([]);
  const toastId = useRef<Id>();

  const navigate = useNavigate();

  const pendingRef = useRef(pendingMints);
  pendingRef.current = pendingMints;

  useEffect(()=>{   
    if (pendingMints.length && !toastId.current) notify();
    else if (pendingMints.length) refresh();
    else {
      dismiss();
      if (ws) ws.close()
    }
  },[pendingMints])

  const notify = () => {
    toastId.current = toast(
      <>
        <span style={{fontSize: '16px', color: '#333'}} className='mr8 ml8'>{pendingMints[0].collectionName}</span><br/>
        <span style={{fontSize: '12px'}} className='mr8 ml8'>Mint Processing</span>
      </>,
      {
        autoClose: false,
        type: 'info',
        closeOnClick: false,
        isLoading: true,
      }  
    );
  };
  const dismiss = () =>  {
    toast.dismiss(toastId.current);
    toastId.current = undefined;
  }
  const refresh = () => {
    if (!toastId.current) {
      notify();
      return;
    }
    toast.update(toastId.current, {render: (
      <>
        <span style={{fontSize: '16px', color: '#333'}} className='mr8 ml8'>{pendingMints[0].collectionName}</span><br/>
        <span style={{fontSize: '12px'}} className='mr8 ml8'>Mint Processing</span>
      </>
    )})
  }

  const waitForMint = (newMint: PendingMint) => {
    const newMints = [...pendingMints, newMint];
    setPendingMints(newMints)

    if (!ws){
      const newWs = new WebSocket(WS_URL);
      newWs.addEventListener("open", (event) => {
        const subscribe = {
          jsonrpc: "2.0",
          method: "subscribe",
          id: 0,
          params: {
              query: "wasm.architech_action='mint'"
          }
        }
        newWs.send(JSON.stringify(subscribe));
      });
      newWs.addEventListener("message", handleWsMessage);
      setWs(newWs)
    }
  }

  const handleWsMessage = ({data}: any) => {
    // Convert to Object
    const object = JSON.parse(data.toString());
    if (typeof object !== 'object') {
      console.error('WS returned unknown data:', object);
      return;
    }

    if (!Object.keys(object.result).length) return;

    switch (object.result.query) {
      case `wasm.architech_action='mint'`:
        // Handle Mint
        const recipient: string = object.result.events['wasm.recipient'][0];
        const collectionAddress: string = object.result.events['wasm.collection'][0];
        const minterAddress: string = object.result.events['wasm.minter'][0];
        const mintedTokenId: string = object.result.events['wasm.token_id'][0];
        const architechApp: string = object.result.events['wasm.architech_app'][0];
        console.log(`Token ID ${mintedTokenId} minted for ${recipient} on collection ${collectionAddress} using app ${architechApp}!`);
        if (recipient !== user?.address) {
          console.log('Mint is not for this user.', recipient, user?.address);
          return;
        }
        // Find if we are waiting for this mint
        const pending = pendingRef.current.findIndex(i=>i.collectionContract===collectionAddress && i.minterContract === minterAddress);
        if (pending === -1) {
          // Didnt find info in pending queue
          console.log(`This mint wasn't in the pending queue`)
          const url = `/nfts/${collectionAddress}/${mintedTokenId}`
          toast.success(
            <div onClick={()=>navigate(url)}>
              Minted NFT on collection ${truncateAddress(collectionAddress)}<br/>
              <span style={{fontSize: '11px'}}>Click to view</span>
            </div>,
            {
              autoClose: 15000
            }
          )
          refreshProfile();
          return;
        }
        // Else
        const url = `/nfts/${pendingRef.current[pending].collectionContract}/${mintedTokenId}`
        toast.success(
          <div onClick={()=>navigate(url)}>
            Minted NFT on collection <span style={{fontWeight: 600}}>{pendingRef.current[pending].collectionName}</span><br/>
            <span style={{fontSize: '11px'}}>Click to view</span>
          </div>,
          {
            autoClose: 15000
          }
        );
        refreshProfile();
        const newMints = [...pendingRef.current]
        newMints.splice(pending,1);
        setPendingMints(newMints);
        break;
    }
  }

  const values = {
    pendingMints,
    waitForMint,
  }
  // add values to provider to reach them out from another component
  return (
    <MintContext.Provider value={values}>
      {children}
    </MintContext.Provider>
  );
};

// created custom hook
export const useMint = (): MintContextState => useContext(MintContext);
