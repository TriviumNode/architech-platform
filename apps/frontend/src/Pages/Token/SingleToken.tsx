import { cancelListing, denomToHuman, findDenom, findToken, purchaseNative, truncateAddress, unknownDenom } from "@architech/lib";
import { Collection, Token, cw721, GetTokenResponse, GetCollectionResponse, Denom } from "@architech/types";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import ArchDenom, { DenomImg } from "../../Components/ArchDenom";
import Badge from "../../Components/Badge";
import CollectionStats from "../../Components/CollectionStats/CollectionStats";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import ListModal from "../../Components/Modals/ListModal";
import PlaceholdImg from "../../Components/PlaceholdImg";
import SmallLoader from "../../Components/SmallLoader";
import SocialLinks from "../../Components/Socials";
import TokenImage from "../../Components/TokenImg";
import VerifiedBadge from "../../Components/Verified";
import Vr from "../../Components/vr";
import { useUser } from "../../Contexts/UserContext";
import { addFavorite, getApiUrl, refreshToken, removeFavorite } from "../../Utils/backend";
import { getPrice } from "../../Utils/data";
import { getCollectionName } from "../../Utils/helpers";
import { MARKETPLACE_ADDRESS } from "../../Utils/queryClient";
import sleep from "../../Utils/sleep";

import styles from './singletoken.module.scss';

type Trait = cw721.Trait;

export type Prices = {
  denom: Denom;
  displayAmount: string;
  displayUsd: string;
}

const SingleToken: FC<any> = (): ReactElement => {
    const { token: tokenResponse, collection: fullCollection } = useLoaderData() as { token: GetTokenResponse, collection: GetCollectionResponse};
    const collection = fullCollection?.collection;

    const [viewFull, setViewFull] = useState(false);
    const [isListing, setIsListing] = useState(false);
    const [loadingTx, setLoadingTx] = useState(false);
    const [prices, setPrices] = useState<Prices>();

    const [activeItem, setActiveItem] = useState('item1')

    const { user, refreshProfile } = useUser()
    const revalidator = useRevalidator()

    const isFavorite = !user ? false :
      !user.profile.favorites.length ? false :
      (user.profile.favorites.findIndex(f=>f.token._id === tokenResponse.token._id)) > -1 ? true : false;

    const handleCancel = async (e: any) => {
      e.preventDefault();
      setLoadingTx(true);

      try {
        if (!user) throw new Error('Wallet is not connected.')
        if (!tokenResponse) throw new Error('Token data is not loaded.')
        const result = await cancelListing({
          client: user.client,
          signer: user.address,
          cw721_contract: tokenResponse?.token.collectionAddress,
          marketplace_contract: MARKETPLACE_ADDRESS,
          token_id: tokenResponse.token.tokenId,
        })
        console.log('TX Result', result);
        await refreshProfile();
        revalidator.revalidate();
      } catch(err: any) {
        console.error(err)
        toast.error(err.toString())
      } finally {
        setLoadingTx(false);
      }
    }

    const handleBuy = async (e: any) => {
      e.preventDefault();
      setLoadingTx(true);
      try {
        if (!user) throw new Error('Wallet is not connected.')
        if (!tokenResponse) throw new Error('Token data is not loaded.')
        const result = await purchaseNative({
          client: user.client,
          signer: user.address,
          cw721_contract: tokenResponse?.token.collectionAddress,
          marketplace_contract: MARKETPLACE_ADDRESS,
          token_id: tokenResponse.token.tokenId,
          amount: tokenResponse.ask.price,
          denom: process.env.REACT_APP_NETWORK_DENOM,
        })
        await refreshToken(tokenResponse.token.collectionAddress, tokenResponse.token.tokenId);
        revalidator.revalidate();
      } catch(err: any) {
        console.error(err)
        toast.error(err.toString())
      } finally {
        setLoadingTx(false);
      }
    }

    const handleFavorite = async (e: any) => {
      e.preventDefault()
      if (!tokenResponse) throw new Error('Token data is not loaded.')
      try { 
        if (isFavorite) await removeFavorite(tokenResponse.token._id)
        else await addFavorite(tokenResponse.token._id);
        await refreshProfile();
        revalidator.revalidate();
      } catch (err: any) {
        console.error('Error adding favorite:', err)
        toast.error(err.toString())
      }
    }

    const calculatePrices = async () => {
      let saleAmount: string = '--';
      let usdAmount: string = '--';
      let saleDenom: Denom = unknownDenom;
      if (tokenResponse?.ask) {
        if (tokenResponse.ask.cw20_contract) {
          const denom = findToken(tokenResponse.ask.cw20_contract);
          if (denom) {
            saleDenom = denom;
            const num = denomToHuman(tokenResponse.ask.price, denom.decimals)
            saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
            usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
          }
        } else {
          const denom = findDenom(process.env.REACT_APP_NETWORK_DENOM);
          if (denom) {
            saleDenom = denom;
            const num = denomToHuman(tokenResponse.ask.price, denom.decimals)
            saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
            usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
          }
        }
      }
      setPrices({
        denom: saleDenom,
        displayAmount: saleAmount,
        displayUsd: usdAmount,
      })
    }

    useEffect(()=>{
      calculatePrices()
    },[])

    if (!tokenResponse || !collection)
        return (
            <Row>
              <Col xs="auto" className="justify-content-center">
                <Loader />
              </Col>
            </Row>
        )
    const tokenImage = tokenResponse.token.metadataExtension?.image || tokenResponse.token.metadataExtension?.image_data || undefined
    const collectionName = getCollectionName(collection);
    const num = isNaN(tokenResponse.token.tokenId as any) ? null : '#'

    // const handleRefresh = async (e: any) => {
    //   e.preventDefault()
    //   const data = await refreshToken(collection.address, tokenResponse.token.tokenId);
    //   settokenResponse(data);
    // }
    return (
      <>
      <ListModal open={isListing} onClose={()=>setIsListing(false)} token={tokenResponse.token} onList={()=>revalidator.revalidate()} />
      <Modal open={viewFull} onClose={()=>setViewFull(false)} innerStyle={{padding: 0, height: 'fit-content', width: 'fit-content'}} style={{height: 'fit-content', width: 'fit-content'}}>
        <TokenImage
          alt={`${collectionName} ${tokenResponse.token.tokenId}`}
          src={tokenImage}
          style={{display: 'block', maxHeight: '80vh', maxWidth: '80vw'}}
          className='wide tall imgCover'
        />
      </Modal>

      {/*  Collection Row */}
      <div className='d-flex gap8' style={{height: '64px', marginBottom: '8px'}}>
        <Col className='tall square br8' xs="auto">
          <Link to={`/nfts/${collection.address}`}>
            <PlaceholdImg alt={collectionName} src={getApiUrl(`/public/${collection.collectionProfile.profile_image}`)} className='tall wide imgCover' />
          </Link>
        </Col>
        <Col className='card d-flex flex-row justify-content-between align-items-center'>
          <div className='d-flex align-items-center gap8'>
            <h2 className='ml16 d-none d-md-block'>{collectionName}</h2>
            {!!collection.verified &&
              <VerifiedBadge content="Collection" />
            }
          </div>
          <h4 className='ml16 d-md-none'>{collectionName}</h4>
          <div style={{paddingRight: '24px'}}  className='d-flex justify-content-between align-items-center'>
            <CollectionStats collection={collection} asks={fullCollection.asks} />
            <SocialLinks discord={collection.collectionProfile.discord} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} />
          </div>
        </Col>
      </div>

      {/* Main Row */}
      <div className='d-flex gap8 mb8 flex-wrap' style={{minWidth: 0}}>
        <Col xs={{span: 8, offset: 2}} md={{span: 6, offset: 0}} className={`br8 square`} style={{maxHeight: '630px'}}>
          <TokenImage alt={`${collectionName} ${tokenResponse.token.tokenId}`} src={tokenImage} className='tall wide imgCover pointer' onClick={()=>setViewFull(true)} />
        </Col>

        {/* Accordian */}
        <Col xs={12} md={true} className={styles.accordionCol}>
          <div className={`${styles.accordionItem} ${activeItem === 'item1' && styles.activeItem} ${styles.firstItem}`}  onClick={()=>setActiveItem('item1')}>
            <div className='d-flex justify-content-between' style={{margin: '32px 32px 16px 32px', height: 'fit-content', width: 'calc(100% - 64px)'}}>
              <div>
                <div className='d-flex align-items-center mb16'>
                  <h1 className='mr8' style={{lineHeight: 1}}>{num}{tokenResponse.token?.tokenId}</h1>
                  {(collection.categories || []).map(category=>
                    <Badge className='mr8'><span>{category}</span></Badge>
                  )}
                </div>
                <span className='lightText14'>Owned by&nbsp;</span>
                <Link style={{overflow: "hidden"}} to={`/profile/${tokenResponse.token?.owner}`}>
                  {truncateAddress(tokenResponse.ownerName, process.env.REACT_APP_NETWORK_PREFIX)}
                </Link>
              </div>
              <div className='d-flex align-items-center'>
                <div className="d-flex align-items-stretch" style={{gap: '16px'}}>
                  <button onClick={handleFavorite} disabled={!!!user} className='clearBtn' style={{padding: 0, height: 'unset'}}>
                    <div className={styles.number}><img alt='' src={isFavorite ? '/red_heart.svg' : '/heart.svg'} style={{height: '1.3em'}} />&nbsp;{tokenResponse.favorites}</div>
                    <span className={styles.label}>Favorites</span>
                  </button>
                  <Vr />
                  <div style={{marginRight: '32px'}}>
                    <div className={`${styles.number} d-flex align-items-center`}><img alt='' src='/eye.svg' style={{height: '1.3em'}} />&nbsp;{tokenResponse.token?.total_views}</div>
                    <span className={styles.label}>Views</span>
                  </div>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
            <div className='d-flex flex-column' style={{flexGrow: 1 }} >
              { !!tokenResponse.token.metadataExtension?.description &&
                <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                  <span className='lightText12'>Description</span>
                  <p style={{margin: '8px 0 0 0 ', fontSize: '12px', padding: '0 8px'}}>{tokenResponse.token.metadataExtension?.description}</p>
                </div>
              }
              { !!(tokenResponse.token.metadataExtension?.attributes && tokenResponse.token.metadataExtension.attributes.length) &&
                <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                  <div className='lightText12 mb8'>Traits</div>
                  <div className='d-flex flex-wrap gap8' style={{margin: '0 8px', width: 'calc(100% - 16px)'}}>
                  {tokenResponse.token.metadataExtension.attributes.map(a=>{
                    return (
                      <div className={`${styles.trait} grayCard`}>
                        <span className={styles.type}>{a.trait_type}</span>
                        <hr />
                        <span className={styles.value}>{a.value}</span>
                      </div>
                    )
                  })}
                  </div>
                </div>
              }
              <div style={{margin: 'auto 32px 12px 0', width: 'fit-content', maxWidth: 'calc(100% - 96px)', alignSelf: 'flex-end'}}>
                <span className='lightText12'>
                  Created by&nbsp;
                  <Link style={{color: '#000'}} to={`/profile/${fullCollection.full_creator.address}`}>
                    {truncateAddress(fullCollection.full_creator.display, process.env.REACT_APP_NETWORK_PREFIX)}
                  </Link>
                </span>
              </div>
            </div>
          </div>

          <div className={`${styles.accordionItem} ${activeItem === 'item2' && styles.activeItem} flex-column`} /*onClick={()=>setActiveItem('item2')}*/ >
            <div style={{margin: '32px'}}>
              <div className={`${styles.itemTitle} lightText14`}>
                <span className='d-flex align-items-center'><img alt='' src='/database.svg' style={{height: '1.2em'}} className='mr8' />Price History</span>
                {/* <FontAwesomeIcon icon={faChevronRight} /> */}
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

          <div className={`${styles.accordionItem} ${activeItem === 'item3' && styles.activeItem} flex-column`} /*onClick={()=>setActiveItem('item3')}*/ >
            <div style={{margin: '32px'}}>
              <div className={`${styles.itemTitle} lightText14`}>
                <span className='d-flex align-items-center'><img alt='' src='/crosshair.svg' style={{height: '1.2em'}} className='mr8' />Listings</span>
                {/* <FontAwesomeIcon icon={faChevronRight} /> */}
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

          <div className={`${styles.accordionItem} ${activeItem === 'item4' && styles.activeItem} flex-column`} style={{marginBottom: 0}} /*onClick={()=>setActiveItem('item4')}*/ >
            <div style={{margin: '32px'}}>
              <div className={`${styles.itemTitle} lightText14`}>
                <span className='d-flex align-items-center'><img alt='' src='/zap.svg' style={{height: '1.2em'}} className='mr8' />Offers</span>
                {/* <FontAwesomeIcon icon={faChevronRight} /> */}
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

        </Col>
      </div>

      {/* Sale Row */}
      <div className='card d-flex' style={{height: '84px', marginBottom: '8px'}}>
        <div style={{margin: '0 16px'}} className='d-flex align-items-center align-self-stretch justify-content-between wide'>
            <div className='d-flex align-items-center lightText justify-content-between'>
              <h2>{!!tokenResponse.token.metadataExtension?.name ? tokenResponse.token.metadataExtension.name : `${num}${tokenResponse.token?.tokenId}`}</h2>
            </div>
            <div className='d-flex align-items-center' style={{gap: '24px'}}>
              { tokenResponse.ask ? 
              <>
                {prices ? 
                <div>
                  <div style={{fontSize: '28px'}}>{prices.displayAmount} <DenomImg denom={prices.denom} size='medium' /></div>
                  <div className='lightText12'>~ ${prices.displayUsd}</div>
                </div>
                :
                <div>
                  <Loader />
                </div>
                }
                {
                  tokenResponse.token.owner === user?.address ? 
                    <button disabled={loadingTx} type='button' onClick={handleCancel}>Cancel Listing{loadingTx && <>&nbsp;<SmallLoader /></>}</button>
                  :
                    <button disabled={loadingTx} type='button' onClick={handleBuy}>Buy now{loadingTx && <>&nbsp;<SmallLoader /></>}</button>
                }
              </>
              :
                tokenResponse.token.owner === user?.address && 
                <button type='button' onClick={()=>setIsListing(true)}>List for sale</button>
              }
            </div>
            </div>
      </div>
    </>
    )
}

export default SingleToken;