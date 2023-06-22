import { Collection, Token } from "@architech/types"
import { FC, ReactElement } from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import ArchDenom from "../ArchDenom"

import styles from './CollectionTile.module.scss'

interface Props {
    collection: Collection,
}

const CollectionTile: FC<Props> = ({ collection }): ReactElement => {
  const collectionName = collection.collectionProfile.name || collection.cw721_name;

  return (
    <Link to={`/nfts/${collection.address}`}>
      <div className={styles.collectionCard}>
          <img style={{width: '100%'}} src={getApiUrl(`/public/${collection.collectionProfile.profile_image}`)} alt={collection.collectionProfile.name} />
          <div className={styles.overlay}>
              <h2>{collectionName}</h2>
              <span style={{display: 'flex', alignItems: 'center'}}>
                  Floor&nbsp;&nbsp;&nbsp;&nbsp;1&nbsp;<ArchDenom />
              </span>
          </div>                       
      </div>
    </Link>
  )
}

export default CollectionTile;