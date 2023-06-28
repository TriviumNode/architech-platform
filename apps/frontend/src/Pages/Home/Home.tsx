// src/pages/Home.tsx

import React, {ReactElement, FC} from "react";
import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import LatestListingsCard from "../NFTs/LatestListingsCard";
import TrendingCard from "../NFTs/TrendingCard";

import styles from './home.module.scss';

const Home: FC<any> = (): ReactElement => {
    return (
        <>
        <div className={styles.headerContainer}>
            <Col xs={12} lg={6} className='d-flex align-items-center'>
                <h1 className={styles.mainHeader}>ONE STOP SHOP<br/>FOR WEB3<br/>COMMUNITIES</h1>
            </Col>
            <Col xs={12} lg={6} className={`d-flex flex-column justify-content-end ${styles.tagContainer}`}>
                <p className='mb8'>
                    Web3 Community Management on Archway.
                </p>
                <p className={styles.tagMargin}>
                    Build your DAO, NFTCommunity, manage treasuries<br />
                    and more at the click of a button.
                </p>
            </Col>
        </div>
        <div className={styles.linkRow}>
            <Col className={`card ${styles.linkCard}`}>
                <Link to='/nfts/createcollection'>
                    <img alt='' src='/placeholder.png' className='imgCover wide tall' />
                    <div className={styles.overlay}>
                        <h2>Create an NFT</h2>
                        <span>Create your own NFT collection now</span>
                    </div>
                </Link>
            </Col>
            <Col className={`card ${styles.linkCard}`}>
                <Link to='/nfts'>
                    <img alt='' src='/placeholder.png' className='imgCover wide tall' />
                    <div className={styles.overlay}>
                        <h2>Market<div className='d-lg-inline' />place</h2>
                        <span>Browse and start collecting</span>
                    </div>
                </Link>
            </Col>
            <Col className={`card ${styles.linkCard}`}>
                <img alt='' src='/placeholder.png' className='imgCover wide tall' />
                <div className={styles.overlay}>
                    <h2>Create a DAO</h2>
                    <span>Coming soon</span>
                </div>
            </Col>
        </div>
        <div className={styles.trendingRow}>
            <Col xs={12} md={6} className={styles.trendingCol}>
                <div style={{margin: '48px'}}>
                    <TrendingCard />
                </div>
            </Col>
            <Col className={styles.trendingCol}>
                <div style={{margin: '48px'}}>
                    <LatestListingsCard />
                </div>
            </Col>
        </div>
        
        <div className={styles.socialRow}>
            <Col xs={12} md={8} className={styles.discordCard}>
                <div style={{margin: '48px'}}>
                    <h2>Join the Architech Discord</h2>
                    <div className='d-flex justify-content-between'>
                        <Col xs='6'>
                            <p>
                                Stay up to date with new listings, drops and collaborations. New features will be added on a monthly basis.<br /> Be the first to know.
                            </p>
                        </Col>
                        <a href='https://discord.gg/56Kn4DQc5P'><button type='button'>join now</button></a>
                    </div>
                </div>
            </Col>
             <Col className={'card'} style={{background: 'url(/placeholder.png)', backgroundPosition: 'center', minHeight: '220px'}}>
                &nbsp;
            </Col>
        </div>
        </>
    );
};

export default Home;