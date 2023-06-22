import { Collection, Token } from "@architech/types"
import React from "react";
import { FC, ReactElement } from "react"
import { Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { saturateColor } from "../../Utils/helpers";
import TokenImage from "../TokenImg";

import styles from './NftTile.module.scss';


interface Props {
    token: Token,
}


const NftTile: FC<any> = ({token}: Props): ReactElement => {
  const {collectionInfo} = token;
  const collectionName = collectionInfo.collectionProfile?.name || collectionInfo.cw721_name
  console.log('TOKEN', token)
  const num = isNaN(token.tokenId as any) ? null : '#'

  const saturated = saturateColor(token.averageColor);

  return (
      // <Col xs={6} md={3} className='p-3'>
      <Link
        to={`/nfts/${token.collectionAddress}/${token.tokenId}`}
        style={{
          display: 'flex',
          backgroundColor: token.averageColor,
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          paddingBottom: '64px'
        }}
      >
        {/* <div style={{backgroundColor: token.averageColor, borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingBottom: '64px'}}> */}
          <TokenImage
              alt={`${collectionName} ${token.tokenId}`}
              src={token.metadataExtension?.image || undefined} 
              style={{width: '105%', objectFit: "cover"}}
              className={styles.fadeImg}
          />
          <div className='imgOverlay d-flex align-items-center' style={{height: '64px', background: saturated, color: '#FFF' }}><h3 style={{margin: '0 0 0 24px'}}>{num}{token.tokenId}</h3></div>
        {/* </div> */}
      </Link>
    // </Col>
  )
}

export default NftTile;