import { Collection, GetCollectionResponse } from "@architech/types";
import React, {ReactElement, FC} from "react";
import { Row, Col } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import ArchDenom from "../../Components/ArchDenom";
import CollectionTile from "../../Components/CollectionTile/CollectionTile";
import CreateTile from "../../Components/CreateTile/CreateTile";
import Loader from "../../Components/Loader";
import FeaturedCarousel from "./Featured";
import LatestListingsCard from "./LatestListingsCard";

import styles from './NFTs.module.scss'
import TrendingCard from "./TrendingCard";

const NftPage: FC<any> = (): ReactElement => {
  const { collections } = useLoaderData() as { collections: GetCollectionResponse[]};
  return (
    <>
      {/* <div className={styles.featuredRow}>
          <div>
              <img src='example/featured1.png' alt='AstroKitKats' />
          </div>
          <div>
              <img src='example/featured2.png' alt='AstroKitKats' />
          </div>
          <div>
              <img src='example/featured3.png' alt='AstroKitKats' />
          </div>
      </div> */}

      <FeaturedCarousel />

      {/* Trending Row */}
      <div className={`${styles.trendingRow}`}>
          <Col className={styles.trendingCard}>
              <TrendingCard />
          </Col>
          <Col className={styles.trendingCard}>
              <LatestListingsCard />
          </Col>
          <Col className={`${styles.infoCard} ${styles.trendingCard}`}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                      <img alt='' src='logo_white.svg' style={{maxHeight: '1em', marginRight: '0.5em'}} />
                      <h2 style={{display: "inline"}}>Architech</h2>
                  </div>
                  <div style={{marginTop: 'auto'}}>
                      <p className={styles.infoText} style={{marginBottom: '36px'}}>
                          A brand new platform for Web3 Community Management on Archway. Build your DAO, NFT Community, manage treasuries and more at the click of a button! 
                      </p>
                      {/* <a href='#' className={styles.infoLink}>Learn more about us</a> */}
                  </div>
          </Col>
      </div>
      <div className={`grayCard wide mb8 d-flex align-items-center`} style={{height: '64px'}}>
          <h2 style={{marginLeft: '24px'}}>Collections</h2>
      </div>
      {/* <div className={styles.collectionsContainer}>
          <CreateTile />
          {collections && collections.map((collection: GetCollectionResponse, key: number)=>{
              // const style = key === 0 ? {gridColumn: 1, gridRow: 1} : key === 1 ? {gridColumn: 2, gridRow: 1} : key === 2 ? {gridColumn: 3, gridRow: 1} : undefined;
              const style = {}
              const className = key === 0 ? styles.item1 : key === 1 ? styles.item2 : key === 2 ? styles.item3 : undefined;
              return(
                  <CollectionTile fullCollection={collection} className={className} style={{...style, ...{maxHeight: '350px'}}} key={key} />
              );
          })}
      </div> */}
      <CollectionsDisplay collections={collections} displayCreateTile={true} />
    </>
  );
};

export default NftPage;

export const CollectionsDisplay = ({collections, displayCreateTile = false}:{collections?: GetCollectionResponse[], displayCreateTile: boolean}) => {
  if (!collections) {
    return (
      <div className='wide d-flex justify-content-center align-items-center' style={{flexGrow: 1, minHeight: '256px'}}>
        <Loader />
      </div>
    )
  }
  return (
    <div className={styles.collectionsContainer}>
      {displayCreateTile && <CreateTile /> }
      {collections.map((collection: GetCollectionResponse, key: number)=>{
          // const style = key === 0 ? {gridColumn: 1, gridRow: 1} : key === 1 ? {gridColumn: 2, gridRow: 1} : key === 2 ? {gridColumn: 3, gridRow: 1} : undefined;
          const style = {}
          const className = key === 0 ? styles.item1 : key === 1 ? styles.item2 : key === 2 ? styles.item3 : undefined;
          return(
              <CollectionTile fullCollection={collection} className={className} style={{...style, ...{maxHeight: '350px'}}} key={key} />
          );
      })}
    </div>
  )
}