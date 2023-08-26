import { parseError, sendNft, transferNft } from "@architech/lib";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SmallLoader from "../../../Components/SmallLoader";
import { useUser } from "../../../Contexts/UserContext";
import { refreshToken } from "../../../Utils/backend";

import styles from '../create.module.scss'

const TransferPage: FC<{
  collectionAddress: string;
  tokenId: string;
  tokenName: string;
}> = ({collectionAddress, tokenId, tokenName}): ReactElement => {
  const {user} = useUser();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: any) => {
    e.preventDefault();

    if (!user) {
      toast.error('Wallet is not connected.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await transferNft({client: user.client, signer: user.address, contract: collectionAddress, tokenId, recipient});
      console.log('*Transfer TX Result*', result);
      await refreshToken(collectionAddress, tokenId);
      toast.success(<>NFT <span style={{fontWeight: 800}}>{tokenName}</span> Transferred</>)
      navigate(`/nfts/${collectionAddress}/${tokenId}`)
    } catch(error) {
      console.error('Failed to transfer NFT', error);
      toast.error(parseError(error))
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{margin: '48px'}} className='d-flex flex-column'>
      <div className='d-flex justify-content-between'>
        <h2 className='mb32'>Transfer<br />NFT</h2>
      </div>
      <Col  xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} className='mb32'>
        <p className='mb8'>
          Transfer this NFT to another Archway address<br />
        </p>
      </Col>

      <form className={styles.form} onSubmit={handleTransfer}>
        <div className='d-flex mb24'>
          <Col xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} >
            <label>
              Recipient
              <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder='archway1a2b...' />
            </label>
          </Col>
        </div>
        <Col xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} style={{textAlign: 'right'}}>
          <button type='submit' disabled={!recipient || loading}>
            Transfer NFT {loading && <>&nbsp;<SmallLoader /></>}
          </button>
        </Col>
      </form>
    </div>
  )
}

export default TransferPage;