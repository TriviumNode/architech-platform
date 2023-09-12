import { FC, ReactElement, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../../Components/SmallLoader";
import { NoisQueryClient, NOIS_PAYMENT_CONTRACT } from "../../Utils/queryClient";
import { queryPaymentContractBalance } from "../../Utils/wasm/proxyQuery";

const AdminNoisStatusPage: FC<{}> = (): ReactElement => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>();

  const handleGetBalance = async () => {
    setLoading(true);
    try {
      const result = await queryPaymentContractBalance({ client: NoisQueryClient, address: NOIS_PAYMENT_CONTRACT})
      console.log(result);
      setBalance(result);
    } catch (err: any) {
      console.error(err)
      toast.error(err.toString());
    }
    setLoading(false);
  }

  useEffect(()=>{
    handleGetBalance();
  },[]);

  return (
    <div style={{margin: '48px'}} className='d-flex flex-column'>
      <div className='d-flex' style={{justifyContent: 'space-between'}}>
        <h2 className='mb32'>NOIS Proxy<br />Status</h2>
      </div>
        
      <div>
        <h4>Payment Contract Balance</h4>
        <div>{balance ? balance.toFixed(3) : <SmallLoader />} NOIS</div>
      </div>

    </div>
  )
}

export default AdminNoisStatusPage;