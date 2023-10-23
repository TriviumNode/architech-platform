import { claimRewards } from "@architech/lib";
import { useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "../../Contexts/UserContext";
import ArchDenom from "../ArchDenom";
import SmallLoader from "../SmallLoader";

const ArchRewardsClaim = () => {
  const {user, balances, devMode, refreshBalances} = useUser()

  const [claiming, setClaiming] = useState(false);

  const handleClaimRewards = async () => {
    try {
      if (!user) throw new Error('Wallet is not connected.')
      if (!balances?.rewards_records) throw new Error('Number of rewards records is 0 or unknown.')
      setClaiming(true);

      const result = await claimRewards({
        client: user.client,
        address: user.address,
        num_records: balances.rewards_records
      })
      console.log('Claim TX Result:', result);
      refreshBalances();
      toast.success('Claimed Arch Rewards')
    } catch (err: any) {
      console.error('Failed to claim Archway Rewards:', err);
      toast.error(err.toString())
    }
    setClaiming(false);
  }
  
  if (!!balances?.rewards || devMode) return (
  <div style={{ border: '1px solid #676767' }} className='mt8 br8'>
    <div style={{ margin: '8px' }}>
      <span className='lightText12'>Arch Rewards</span><br/>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: 'center'
      }}>
        <span className='d-flex align-items-center'>{(balances?.rewards || 0).toFixed(3)}&nbsp;<ArchDenom /></span>
        <button
          id='claimButton'
          style={{height: 'unset', padding: '12px' }}
          disabled={claiming}
          onClick={()=>handleClaimRewards()}>{claiming ? <SmallLoader /> : 'Claim'}
        </button>
      </div>
    </div>
  </div>
  );
  else return <></>
}

export default ArchRewardsClaim;