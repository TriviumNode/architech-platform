import { findFloor } from "@architech/lib"
import { Collection, GetCollectionResponse, Token } from "@architech/types"
import { CSSProperties, FC, ReactElement } from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import { getCollectionName } from "../../Utils/helpers"
import ArchDenom from "../ArchDenom"
import PlaceholdImg from "../PlaceholdImg"

import styles from './CollectionTile.module.scss'

interface Props {
    fullCollection: GetCollectionResponse,
    style?: CSSProperties,
}

const CollectionTile: FC<Props> = ({ fullCollection, style }): ReactElement => {
  console.log('FULL COLLECTION', fullCollection)
  const { collection } = fullCollection;
  const collectionName = getCollectionName(collection);

  const floor = findFloor(fullCollection.asks, parseInt(process.env.REACT_APP_NETWORK_DECIMALS));

  return (
    <Link to={`/nfts/${collection.address}`} style={style}>
      <div className={styles.collectionCard}>
          <PlaceholdImg style={{width: '100%'}} src={getApiUrl(`/public/${collection.collectionProfile?.profile_image}`)} alt={collectionName} />
          <div className={styles.overlay}>
              <h2>{collectionName}</h2>
              <span style={{display: 'flex', alignItems: 'center'}}>
                  Floor&nbsp;&nbsp;&nbsp;&nbsp;{floor || '--'}&nbsp;<ArchDenom />
              </span>
          </div>                       
      </div>
    </Link>
  )
}

export default CollectionTile;