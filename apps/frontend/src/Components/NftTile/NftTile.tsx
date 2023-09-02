import { denomToHuman, findDenom, findToken, getPrice, unknownDenom } from "@architech/lib";
import { Collection, Denom, Token } from "@architech/types"
import React from "react";
import { FC, ReactElement } from "react"
import { Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { saturateColor } from "../../Utils/helpers";
import ArchDenom from "../ArchDenom";
import TokenImage from "../TokenImg";

import styles from './NftTile.module.scss';


interface Props {
    token: Token,
}


const NftTile: FC<any> = ({token}: Props): ReactElement => {
  const {collectionInfo} = token;
  const collectionName = collectionInfo.collectionProfile?.name || collectionInfo.cw721_name
  const num = isNaN(token.tokenId as any) ? null : '#'

  const saturated = saturateColor(token.averageColor);

  let saleAmount: string = '--';
  let saleDenom: Denom = unknownDenom;
  if (token?.ask) {
    if (token.ask.cw20_contract) {
      const denom = findToken(token.ask.cw20_contract);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(token.ask.price, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
      }
    } else {
      const denom = findDenom(process.env.REACT_APP_NETWORK_DENOM);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(token.ask.price, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
      }
    }
  }

  return (
      // <Col xs={6} md={3} className='p-3'>
      <Link
        to={`/nfts/${token.collectionAddress}/${encodeURIComponent(token.tokenId)}`}
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
          {/* <div className='imgOverlay d-flex flex-column justify-content-center' style={{height: '64px', background: saturated, color: '#FFF' }}> */}
          <div className='imgOverlay d-flex align-items-center' style={{height: '64px', background: saturated, color: '#FFF' }}>
            <h3 style={{margin: '0 0 0 24px'}} className='oneLineLimit'>{num}{token.tokenId} {!!token.metadataExtension?.name && <span> - {token.metadataExtension?.name}</span>}</h3>
            {!!token.ask &&
              <div style={{
                display: 'flex',
                alignItems: 'center',
                // alignSelf: 'flex-end',
                margin: '0 16px'
              }}>
                {saleAmount || '--'}&nbsp;<ArchDenom />
              </div>
            }
          </div>
        {/* </div> */}
      </Link>
    // </Col>
  )
}

export default NftTile;