import { denomToHuman, findDenom, findFloor } from "@architech/lib"
import { Collection, GetCollectionResponse, Token } from "@architech/types"
import { CSSProperties, FC, ReactElement } from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import { getCollectionName } from "../../Utils/helpers"
import ArchDenom, { DenomImg } from "../ArchDenom"
import PlaceholdImg from "../PlaceholdImg"

import styles from './CollectionTile.module.scss'

interface Props {
    fullCollection: GetCollectionResponse,
    style?: CSSProperties,
    className?: string,
}

const CollectionTile: FC<Props> = ({ fullCollection, style, className }): ReactElement => {
  const { collection } = fullCollection;
  const collectionName = getCollectionName(collection);

  // const floor = findFloor(fullCollection.asks, parseInt(process.env.REACT_APP_NETWORK_DECIMALS));
  const floor: number = denomToHuman(fullCollection.floor || 0, parseInt(process.env.REACT_APP_NETWORK_DECIMALS))

  let row2 = (
    <div className='wide d-flex justify-content-between'>
      <div>Floor</div>
      <div className='d-flex align-items-center'>{floor || '--'}&nbsp;<ArchDenom /></div>
    </div>
  );
  let link = `/nfts/${collection.address}`
  if (collection.collectionMinter) {
    const launch_time = collection.collectionMinter.launch_time ? new Date(parseInt(collection.collectionMinter.launch_time) * 1000) : undefined;
    const end_time = collection.collectionMinter.end_time ? new Date(parseInt(collection.collectionMinter.end_time) * 1000) : undefined;

    // Check if Minting is Open or in Future
    if (
        // No end time
        !end_time ||
        // Or end time if in future
        end_time.valueOf() > new Date().valueOf()
      )
    { 
      link = `/nfts/mint/${collection.address}`
      const text = (launch_time && launch_time.valueOf() > new Date().valueOf()) ?
        `Minting ${launch_time.toLocaleDateString()}`
      :
        'Minting Now'
      if (collection.collectionMinter.payment){
        const denom = findDenom((collection.collectionMinter.payment.denom || collection.collectionMinter.payment.token) as string);
        const humanPrice = denomToHuman(collection.collectionMinter.payment.amount, denom.decimals)
        // row2 = <>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{humanPrice}&nbsp;<DenomImg denom={denom}/></>
        row2 = (
          <div className='wide d-flex justify-content-between'>
            <div>{text}</div>
            <div className='d-flex align-items-center'>{humanPrice}&nbsp;<DenomImg denom={denom} /></div>
          </div>
        );
      } else 
        // row2 = <>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Free&nbsp;<ArchDenom /></>
        row2 = (
          <div className='wide d-flex justify-content-between'>
            <div>{text}</div>
            <div className='d-flex align-items-center'>Free&nbsp;<ArchDenom /></div>
          </div>
        );
    } else if (
      // Launch time
      launch_time &&
      // Launch time is in future
      launch_time.valueOf() > new Date().valueOf()
    ) {

    }
  }

  const imgUrl = collection.collectionProfile?.profile_image ? getApiUrl(`/public/${collection.collectionProfile?.profile_image}`) : undefined;
  return (
    <Link to={link} style={style} className={className}>
      <div className={styles.collectionCard}>
          <PlaceholdImg style={{width: '100%'}} src={imgUrl} alt={collectionName} />
          <div className={styles.overlay}>
            <div style={{width: 'fit-content', height: '100%'}} className='d-flex flex-column justify-content-end'>
              <div>
                <h2 className='twoLineLimit'>{collectionName}</h2>
              </div>
              <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                {row2}
              </div>
            </div>
          </div>                       
      </div>
    </Link>
  )
}

export default CollectionTile;