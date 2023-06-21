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
    // return (
    //   // <Col xs={6} md={4} style={{}} className={styles.tileContainer}>
    //   <Col style={{}} className={styles.tileContainer}>
    //     <Link to={`/nfts/${collection.address}`}>
    //       <div style={{backgroundColor: '#555555', borderRadius: '10px', overflow: 'hidden'}}>

    //           { !!collection.collectionProfile.profile_image ?
    //             <img
    //                 alt={collectionName}
    //                 src={getApiUrl(`/public/${collection.collectionProfile.profile_image}`} 
    //                 style={{width: '100%', backgroundColor: '#444'}}
    //             />

    //             :
    //             <div style={{
    //               width: '100%',
    //               height: 0,
    //               paddingBottom: '100%',
    //               background: 'linear-gradient(to bottom left, rgb(345, 123, 98), rgb(12, 211, 123), rgb(123, 231, 11))'
    //             }}>
    //             </div>
    //           }

    //         <h4>{collectionName}</h4>
    //         <Row className="justify-content-space-between">
    //           <Col>
    //             <span>{collection.totalTokens} Items</span>
    //           </Col>
    //           <Col>
    //             <span>TODO Floor Price</span>
    //           </Col>
    //         </Row>
    //         {!!collection.collectionProfile.description && 
    //         <p>
    //           {collection.collectionProfile.description}
    //         </p>
    //         }
    //       </div>
    //     </Link>
    //   </Col>
    // )
}

export default CollectionTile;