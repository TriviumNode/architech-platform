import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Modal from "../../Components/Modal";
import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../SmallLoader";
//@ts-expect-error
import * as NumericInput from "react-numeric-input";
import { Prices } from "../../Utils/data";
import Loader from "../Loader";
import { Collection, minter } from "@architech/types";
import ModalV2 from "../ModalV2";
import { getCollectionName, isRandomnessReady } from "../../Utils/helpers";
import { denomToHuman, mintRandom, parseError } from "@architech/lib";
import { useMint } from "../../Contexts/MintContext";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  minterStatus: minter.GetMintStatusResponse | undefined;
  buyerStatus: minter.GetMintLimitResponse | undefined;
  prices: Prices | undefined;
  collection: Collection;
  onClose: () => any;
  onMint?: () => any;
}

const limitSingleTx = 10;

export default function MintModal({open, minterStatus, buyerStatus, prices, collection, onClose, onMint = ()=>{}}: Props) {
    const { user, refreshProfile } = useUser()
    const { waitForMint } = useMint()

    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const collectionName = getCollectionName(collection)

    if (!collection.collectionMinter) throw new Error('Not a minter collection.')

    if (prices === undefined || minterStatus === undefined || buyerStatus === undefined) {
      return (
        <Modal open={open} onClose={onClose} style={{width: '40%'}}>
          <div className='d-flex justify-content-center align-items-center'>
            <Loader />
          </div>
        </Modal>
      )
    }

    // Calculate how many NFT's the buyer is allowed to still purchase, otherwise use TX purchase limit
    const buyerMintLimit = buyerStatus.mint_limit ?
      buyerStatus.mint_limit - (buyerStatus.mints || 0)
      : limitSingleTx;
    
    // If limit is above remaining stock, set limit to remaining stock
    const buyerMax = buyerMintLimit > minterStatus.remaining ? minterStatus.remaining : buyerMintLimit

    // If calculated max is above single TX limit, set max to single TX limit
    const max = buyerMax > limitSingleTx ? limitSingleTx : buyerMax;

    // Determint if buyer pays public or private price
    const price = buyerStatus.whitelisted && prices.private ? prices.private : prices.public;

    // Calculate total for purchase
    const denomTotal = price.denomAmount * quantity;
    const denomDisplay = denomToHuman(denomTotal, price.denom.decimals);


    const handleMint = async (e?: any) => {
      if (e.preventDefault) e.preventDefault();

      // I already check for this stfu typescript
      if (!collection.collectionMinter) throw new Error('Not a minter collection.')

      try {
        if (!user) throw new Error('Wallet is not connected.')

        if (quantity > minterStatus.remaining) throw new Error(`Requested quantity exceeds available stock. Only ${minterStatus.remaining} NFTs are available in this minter.`)
        if (quantity > max) throw new Error(`Maximum number of mints is ${max}`)
        setLoading(true);

        // Query NOIS payment contract to ensure enough funds.
        await isRandomnessReady()

        const funds = collection.collectionMinter.payment?.denom ? [{amount: denomTotal.toString(), denom: collection.collectionMinter.payment.denom}] : []
        console.log('FUNDS', funds)
        const result = await mintRandom({
          client: user.client,
          signer: user.address,
          minter_contract: collection.collectionMinter.minter_address,
          funds,
          mints: quantity,
        })
        console.log('Mint Result', result);
  
        if (collection.collectionMinter.minter_type === "RANDOM")
          waitForMint({
            collectionContract: collection.address,
            collectionName: getCollectionName(collection),
            minterContract: collection.collectionMinter?.minter_address
          })
        else {
          refreshProfile();
          toast.success('Successfully minted!')
        }
        onMint();
        setLoading(false);
        onClose();
      } catch(err: any) {
        setLoading(false);
        console.error(err)
        toast.error(parseError(err))
        onClose();
      }
    }

    const handleChange = (input: number) => {
      if (input > max){
        setQuantity(max);
      } else {
        setQuantity(input);
      }
    }

    return(
      <ModalV2 open={open} onClose={onClose} style={{width: 'fit-content'}} title={<span>Minting <b>{collectionName}</b></span>} closeButton={true}>
        <Row className='mb16 justify-content-center mt16 mb16'>
          <Col xs={6} className='d-flex flex-column justify-content-center'>
            NFTs to Mint
          </Col>
          <Col xs={{span: 3, offset: 2}}>
            <NumericInput
              min={1}
              max={max}
              value={quantity}
              onChange={handleChange}
              style={{
                input: {
                  width: '100%'
                }
              }}
            />
          </Col>
        </Row>

        <div className='d-flex flex-column gap8 mb16' style={{margin: '0px 16px'}}>
          <div className='d-flex flex-column gap8' style={{margin: '0px 16px'}}>
            <div className='d-flex justify-content-between'>
              <span style={{fontWeight: '600'}}>Total</span>
              <span>{`${denomDisplay.toLocaleString(undefined, {maximumFractionDigits: 4})} ${price.denom.displayDenom}`}</span>
            </div>
          </div>
        </div>
        <Row style={{marginTop: '20px', justifyContent: 'flex-end'}}>
          <Col xs="auto">
            <button type="button" disabled={loading} onClick={handleMint}>Mint{loading && <>&nbsp;<SmallLoader /></> }</button>
          </Col>
        </Row>
      </ModalV2>
    )
}