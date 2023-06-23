import { cancelListing, denomToHuman, findDenom, findToken, MARKETPLACE_ADDRESS, purchaseNative } from "@architech/lib";
import { Collection, Token, cw721, GetTokenResponse, GetCollectionResponse, Denom } from "@architech/types";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import ArchDenom, { DenomImg } from "../../Components/ArchDenom";
import Badge from "../../Components/Badge";
import CollectionStats from "../../Components/CollectionStats/CollectionStats";
import Loader from "../../Components/Loader";
import ListModal from "../../Components/Modals/ListModal";
import SocialLinks from "../../Components/Socials";
import TokenImage from "../../Components/TokenImg";
import Vr from "../../Components/vr";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl, refreshToken } from "../../Utils/backend";
import { getCollectionName } from "../../Utils/helpers";

import styles from './singletoken.module.scss';

type Trait = cw721.Trait;

const SingleToken: FC<any> = (): ReactElement => {
    const { token: tokenResponse, collection: fullCollection } = useLoaderData() as { token?: GetTokenResponse, collection?: GetCollectionResponse};
    const collection = fullCollection?.collection;
    const [tokenData, setTokenData] = useState<GetTokenResponse | undefined>(tokenResponse);

    const [isListing, setIsListing] = useState(false);

    const { user } = useUser()
    const revalidator = useRevalidator()

    const handleCancel = async (e: any) => {
      e.preventDefault();
      try {
        if (!user) throw new Error('Wallet is not connected.')
        if (!tokenData) throw new Error('Token data is not loaded.')
        const result = await cancelListing({
          client: user.client,
          signer: user.address,
          cw721_contract: tokenData?.token.collectionAddress,
          marketplace_contract: MARKETPLACE_ADDRESS,
          token_id: tokenData.token.tokenId,
        })
        console.log(result);
        revalidator.revalidate();
      } catch(err: any) {
        console.error(err)
        toast.error(err.toString())
      }
    }

    const handleBuy = async (e: any) => {
      e.preventDefault();
      try {
        if (!user) throw new Error('Wallet is not connected.')
        if (!tokenData) throw new Error('Token data is not loaded.')
        const result = await purchaseNative({
          client: user.client,
          signer: user.address,
          cw721_contract: tokenData?.token.collectionAddress,
          marketplace_contract: MARKETPLACE_ADDRESS,
          token_id: tokenData.token.tokenId,
          amount: tokenData.sale.price,
          denom: process.env.REACT_APP_NETWORK_DENOM,
        })
        console.log('Purchase Result',result);
        await refreshToken(tokenData.token.collectionAddress, tokenData.token.tokenId)
        revalidator.revalidate();
      } catch(err: any) {
        console.error(err)
        toast.error(err.toString())
      }
    }

    useEffect(()=>{
      setTokenData(tokenResponse);
    },[tokenResponse])

    let saleAmount: string = '--';
    let saleDenom: Denom = {
      decimals: 0,
      displayDenom: 'UNKNOWN',
      image: 'arch.svg',
    };
    if (tokenData?.sale) {
      if (tokenData.sale.cw20_contract) {
        const denom = findToken(tokenData.sale.cw20_contract);
        if (denom) {
          saleDenom = denom;
          saleAmount = denomToHuman(tokenData.sale.price, denom.decimals).toString()
        }
      } else {
        const denom = findDenom(process.env.REACT_APP_NETWORK_DENOM);
        if (denom) {
          saleDenom = denom;
          saleAmount = denomToHuman(tokenData.sale.price, denom.decimals).toString()
        }
      }
    }
    console.log('saleAmount', saleAmount)


    if (!tokenData || !collection)
        return (
            <Row>
              <Col xs="auto" className="justify-content-center">
                <Loader />
              </Col>
            </Row>
        )
    console.log(tokenData)
    const tokenImage = tokenData.token.metadataExtension?.image || tokenData.token.metadataExtension?.image_data || undefined
    const collectionName = getCollectionName(collection);
    const num = isNaN(tokenData.token.tokenId as any) ? null : '#'

    // const handleRefresh = async (e: any) => {
    //   e.preventDefault()
    //   const data = await refreshToken(collection.address, tokenData.token.tokenId);
    //   setTokenData(data);
    // }
      console.log('user!', user)
    console.log(collection.collectionProfile)
    return (
      <>
      <ListModal open={isListing} onClose={()=>setIsListing(false)} token={tokenData.token} />
      <div className='d-flex gap8' style={{height: '64px', marginBottom: '8px'}}>
        <Col className='tall square br8' xs="auto">
          <Link to={`/nfts/${collection.address}`}>
            <img alt={collectionName} src={getApiUrl(`/public/${collection.collectionProfile.profile_image}`)} className='tall wide imgCover' />
          </Link>
        </Col>
        <Col className='card d-flex flex-row justify-content-between align-items-center'>
          <h2 className='ml16'>{collectionName}</h2>
          <div style={{width: '50%', paddingRight: '24px'}}  className='d-flex justify-content-between align-items-center'>
            <CollectionStats collection={collection} asks={fullCollection.forSale} />
            <SocialLinks discord={collection.collectionProfile.discord} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} />
          </div>
        </Col>
      </div>
      <div className='d-flex colGap8'>
        <Col xs={12} md={6} className={`br8 square`} style={{maxHeight: '630px'}}>
          <TokenImage alt={`${collectionName} ${tokenData.token.tokenId}`} src={tokenImage} className='tall wide imgCover' />
        </Col>
        <Col className='d-flex flex-column'>
          <div className='d-flex card justify-content-between' style={{height: '128px', marginBottom: '8px'}}>
            <div style={{margin: '24px 0 0 24px'}}>
              <div className='d-flex align-items-center mb16'><h1 className='mr8' style={{lineHeight: 1}}>{num}{tokenData.token?.tokenId}</h1>
                {(collection.categories || []).map(category=>
                  <Badge><span>{category}</span></Badge>
                )}
              </div>
              <span className='lightText14'>Owned by&nbsp;</span><Link to={`/profile/${tokenData.token?.owner}`}>{tokenData.token?.owner}</Link>
            </div>
            <div className='d-flex align-items-center mr16'>
              <div className="d-flex align-items-stretch" style={{gap: '16px'}}>
                <div>
                  <div className={styles.number}><img src='/heart.svg' style={{height: '1.3em'}} />&nbsp;321</div>
                  <span className={styles.label}>Favorites</span>
                </div>
                {/* <div style={{alignSelf: 'stretch'}}> */}
                  <Vr />
                {/* </div> */}
                <div className='mr16'>
                  <div className={`${styles.number} d-flex align-items-center`}><img src='/eye.svg' style={{height: '1.3em'}} />&nbsp;{tokenData.token?.total_views}</div>
                  <span className={styles.label}>Views</span>
                </div>
              </div>
          </div>
          </div>

          <div className='d-flex card flex-column' style={{minHeight: '300px', marginBottom: '8px'}}>
            <div style={{margin: '32px'}}>
              <div className='d-flex align-items-center lightText14'>
                <img src='/database.svg' style={{height: '1.2em'}} className='mr8' />Price History
              </div>

            </div>
          </div>
          <div className='d-flex card flex-column' style={{height: '89px', marginBottom: '8px'}}>
            <div style={{margin: '32px'}}>
              <div className='d-flex align-items-center lightText14'>
                <img src='/database.svg' style={{height: '1.2em'}} className='mr8' /><span>Listings</span>
              </div>

            </div>
          </div>
          <div className='d-flex card flex-column' style={{height: '89px', marginBottom: '8px'}}>
            <div style={{margin: '32px'}}>
              <div className='d-flex align-items-center lightText14'>
                <img src='/database.svg' style={{height: '1.2em'}} className='mr8' /><span>Offers</span>
              </div>

            </div>
          </div>


        </Col>
      </div>
      <div className='card d-flex' style={{height: '84px', marginBottom: '8px'}}>
        <div style={{margin: '0 16px'}} className='d-flex align-items-center align-self-stretch justify-content-between wide'>
            <div className='d-flex align-items-center lightText justify-content-between'>
              <h2>{num}{tokenData.token?.tokenId}</h2>
            </div>
            <div className='d-flex align-items-center' style={{gap: '24px'}}>
              { tokenData.sale ? 
              <>
                <div>
                  <div style={{fontSize: '28px'}}>{saleAmount.toString()} <DenomImg denom={saleDenom} size='medium' /></div>
                  <div className='lightText12'>~ $1.23</div>
                </div>
                {
                  tokenData.token.owner === user?.address ? 
                    <button type='button' onClick={handleCancel}>Cancel Listing</button>
                  :
                    <button type='button' onClick={handleBuy}>Buy now</button>
                }
              </>
              :
                tokenData.token.owner === user?.address && 
                <button type='button' onClick={()=>setIsListing(true)}>List for sale</button>
              }
            </div>
            </div>
          </div>
    </>
    )
}

export default SingleToken;