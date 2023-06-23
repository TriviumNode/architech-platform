import { Collection } from "@architech/types";
import React, {ReactElement, FC} from "react";
import { Row, Col } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import ArchDenom from "../../Components/ArchDenom";
import CollectionTile from "../../Components/CollectionTile/CollectionTile";
import CreateTile from "../../Components/CreateTile/CreateTile";

import styles from './NFTs.module.scss'
import TrendingCard from "./TrendingCard";

const NftPage: FC<any> = (): ReactElement => {
    const { collections } = useLoaderData() as { collections: any[]};
    console.log(collections);
    return (
        <>
        {/* <div className={styles.featuredContainer}>
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
        <div className={`${styles.gridContainer} ${styles.trendingContainer}`}>
            {/* <div className={styles.listCard}>
                <h2>Trending</h2>
                <Row style={{width: '100%', marginBottom: '24px'}}>
                    <Col xs={8}>
                        <span>Project</span>
                    </Col>
                    <Col xs={2}>
                        <span>Floor</span>
                    </Col>
                    <Col xs={2}>
                        <span>Volume</span>
                    </Col>
                </Row>
            </div> */}
            <TrendingCard />
            <div className={`${styles.listCard}`}>
                <h2>Latest Listings</h2>
                <Row style={{width: '100%', marginBottom: '24px'}}>
                    <Col xs={8}>
                        <span>Project</span>
                    </Col>
                    <Col xs={2}>
                        <span>Floor</span>
                    </Col>
                    <Col xs={2}>
                        <span>Volume</span>
                    </Col>
                </Row>
                <Row style={{width: '100%'}}>
                    <Col xs={8}>
                        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                            <img src="logo.svg" className={styles.nftImage} />
                            <div>
                                <span>Title</span><br />
                                <span>Description</span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <Row style={{width: '100%'}}>
                    <Col xs={8}>
                        {/* <Row style={{width: '100%'}}> */}
                        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                            <img src="logo.svg" className={styles.nftImage} />
                            <div>
                                <span>Title</span><br />
                                <span>Description</span>
                            </div>
                        </div>
                        {/* </Row> */}
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <Row style={{width: '100%'}}>
                    <Col xs={8}>
                        {/* <Row style={{width: '100%'}}> */}
                        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                            <img src="logo.svg" className={styles.nftImage} />
                            <div>
                                <span>Title</span><br />
                                <span>Description</span>
                            </div>
                        </div>
                        {/* </Row> */}
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                    <Col xs={2}>
                        <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                            <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                            }}>1&nbsp;<ArchDenom /></span>
                        </Row>
                    </Col>
                </Row>
            </div>
            <div className={styles.infoCard}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <img src='logo_white.svg' style={{maxHeight: '1em', marginRight: '0.5em'}} />
                        <h2 style={{display: "inline"}}>Architech</h2>
                    </div>
                    <div style={{marginTop: 'auto'}}>
                        <p className={styles.infoText} style={{marginBottom: '36px'}}>
                            A brand new platform for Web3 Community Management on Archway. Build your DAO, NFTCommunity, manage treasuries and more at the click of a button! 
                        </p>
                        <a href='#' className={styles.infoLink}>Learn more about us</a>
                    </div>
            </div>
        </div>
        <div className={`grayCard wide mb8 d-flex align-items-center`} style={{height: '64px'}}>
            <h2 style={{marginLeft: '24px'}}>Collections</h2>
        </div>
        <div className={styles.collectionsContainer}>
            <CreateTile />
            {collections && collections.map((collection: Collection, key: number)=>{
                console.log('key', key)
                const style = key === 0 ? {gridColumn: 1, gridRow: 1} : key === 1 ? {gridColumn: 2, gridRow: 1} : key === 2 ? {gridColumn: 3, gridRow: 1} : undefined;
                return(
                    <CollectionTile collection={collection} style={{...style, ...{maxHeight: '350px'}}} key={key} />
                );
            })}
        </div>



        {/* <div className={styles.container}>
            <Row>
                <Col className={styles.featureCol} xs={12} md={4}>
                    <Col className={styles.innerCol}>
                        <h2>Trending</h2>
                    
                    </Col>
                </Col>
                <Col className={styles.featureCol} xs={12} md={4}>
                    <Col className={styles.innerCol}>
                        <h2>Latest Listings</h2>
                        <Row style={{width: '100%'}}>
                            <Col xs={8}>
                                <span>Project</span>
                            </Col>
                            <Col xs={2}>
                                <span>Floor</span>
                            </Col>
                            <Col xs={2}>
                                <span>Volume</span>
                            </Col>
                        </Row>
                        <Row style={{width: '100%'}}>
                            <Col xs={8}>
                                <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                                    <img src="logo.svg" className={styles.nftImage} />
                                    <div>
                                        <span>Title</span><br />
                                        <span>Description</span>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={2}>
                                <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                    }}>1&nbsp;<ArchDenom /></span>
                                </Row>
                            </Col>
                            <Col xs={2}>
                                <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                    }}>1&nbsp;<ArchDenom /></span>
                                </Row>
                            </Col>
                        </Row>
                        <hr />
                    </Col>

                </Col>
                <Col className={styles.endCol} xs={12} md={4}>
                    <Col className={styles.innerCol}>
                        <Row>
                        <span><img src='logo_white.svg' style={{maxHeight: '100%', marginRight: '0.5em'}} /><h2 style={{display: "inline"}}>Architech</h2></span>
                        </Row>

                    </Col>
                </Col>
            </Row>
            {collections && collections.map((collection: Collection)=>{
                const collectionName = collection.collectionProfile.name || collection.cw721_name
                return(
                    <div>
                        <div style={{display: 'flex'}}>
                            <Link to={`/nfts/${collection.address}`}><h3 style={{margin: 0}}>{collectionName}</h3></Link>
                            <p style={{paddingLeft: '10px'}}>{collection.totalTokens} Items</p>
                        </div>
                        <h6 style={{margin: 0}}>Created By: {collection.creator}</h6>
                    </div>
                
                );
            })}
        </div> */}
        </>
    );
};

export default NftPage;