import { denomToHuman, findDenom, findToken, mintWithMinter, noDenom, truncateAddress, unknownDenom } from "@architech/lib";
import { cw721, GetCollectionResponse, Denom } from "@architech/types";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import { DenomImg } from "../../Components/ArchDenom";
import Badge from "../../Components/Badge";
import Loader from "../../Components/Loader";
import SmallLoader from "../../Components/SmallLoader";
import TokenImage from "../../Components/TokenImg";
import Vr from "../../Components/vr";
import { useMint } from "../../Contexts/MintContext";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl } from "../../Utils/backend";
import { getPrice } from "../../Utils/data";
import { getCollectionName } from "../../Utils/helpers";
import { Prices } from "../Token/SingleToken";

import styles from './minter.module.scss';

type Trait = cw721.Trait;

const SingleMinter: FC<any> = (): ReactElement => {
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const { waitForMint } = useMint()
    const collection = fullCollection?.collection;

    const [isListing, setIsListing] = useState(false);
    const [loadingTx, setLoadingTx] = useState(false);
    const [prices, setPrices] = useState<Prices>();

    const { user, refreshProfile } = useUser()
    const revalidator = useRevalidator()

    // const isFavorite = !user ? false :
    //   !user.profile.favorites.length ? false :
    //   (user.profile.favorites.findIndex(f=>f.token._id === tokenResponse.token._id)) > -1 ? true : false;

    const handleMint = async (e?: any) => {
      if (e) e.preventDefault();
      try {
        if (!user) throw new Error('Wallet is not connected.')
        if (!collection.collectionMinter) throw new Error('Minter not found for this collection.')
        if (collection.collectionMinter.payment_token) throw new Error('Non-native payments are not supported.')
        setLoadingTx(true);
        const result = await mintWithMinter({
          client: user.client,
          signer: user.address,
          minter_contract: collection.collectionMinter.minter_address,
          funds: collection.collectionMinter.payment_denom ? [{amount: collection.collectionMinter.payment_amount, denom: collection.collectionMinter.payment_denom}] : [],
        })
        console.log('Mint Result', result);
        if (collection.collectionMinter.minter_type === "RANDOM")
          waitForMint({
            collectionContract: collection.address,
            collectionName: getCollectionName(collection),
            minterContract: collection.collectionMinter?.minter_address
          })
        else {
          refreshProfile();
          toast.success('Successfully minted!')
        }
      } catch(err: any) {
        console.error(err)
        toast.error(err.toString())
      } finally {
        setLoadingTx(false);
      }
    }

    const handleFavorite = async (e: any) => {
      e.preventDefault()
      // if (!tokenResponse) throw new Error('Token data is not loaded.')
      // try { 
      //   if (isFavorite) await removeFavorite(tokenResponse.token._id)
      //   else await addFavorite(tokenResponse.token._id);
      //   await refreshProfile();
      //   revalidator.revalidate();
      // } catch (err: any) {
      //   console.error('Error adding favorite:', err)
      //   toast.error(err.toString())
      // }
    }

    const calculatePrices = async () => {
      if (!collection.collectionMinter) return;
      let saleAmount: string = '--';
      let usdAmount: string = '--';
      let saleDenom: Denom = unknownDenom;
      if (collection.collectionMinter.payment_token) {
        const denom = findToken(collection.collectionMinter.payment_token);
        if (denom) {
          saleDenom = denom;
          const num = denomToHuman(collection.collectionMinter.payment_amount, denom.decimals)
          saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
          usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
        }
      } else if (collection.collectionMinter.payment_denom) {
        const denom = findDenom(collection.collectionMinter.payment_denom);
        if (denom) {
          saleDenom = denom;
          const num = denomToHuman(collection.collectionMinter.payment_amount, denom.decimals)
          saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
          usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
        }
      } else {
        saleAmount = 'Free';
        usdAmount = '';
        saleDenom = noDenom;
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

    if (!collection)
      return (
          <Row>
            <Col xs="auto" className="justify-content-center">
              <Loader />
            </Col>
          </Row>
      )

    if (!!!collection.collectionMinter)
      return (
        <div><h6>Not a minter</h6></div>
      )


    const collectionName = getCollectionName(collection);
    const collectionImage = collection.collectionProfile?.profile_image ? getApiUrl(`/public/${collection.collectionProfile?.profile_image}`) : undefined;

    // const handleRefresh = async (e: any) => {
    //   e.preventDefault()
    //   const data = await refreshToken(collection.address, tokenResponse.token.tokenId);
    //   settokenResponse(data);
    // }

    // let saleAmount: string = '--';
    // let usdAmount: string = '--';
    // let saleDenom: Denom = unknownDenom;
    //   if (collection.collectionMinter.payment_token) {
    //     const denom = findToken(collection.collectionMinter.payment_token);
    //     if (denom) {
    //       saleDenom = denom;
    //       const num = denomToHuman(collection.collectionMinter.payment_amount, denom.decimals)
    //       saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(denom.decimals.toString()) })
    //       usdAmount = await getPrice(saleDenom.displayDenom, num).toLocaleString("en-US", { maximumFractionDigits: 2 });
    //     }
    //   } else {
    //     const denom = findDenom(process.env.REACT_APP_NETWORK_DENOM);
    //     if (denom) {
    //       saleDenom = denom;
    //       const num = denomToHuman(collection.collectionMinter.payment_amount, denom.decimals)
    //       saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(denom.decimals.toString()) })
    //       usdAmount = await getPrice(saleDenom.displayDenom, num).toLocaleString("en-US", { maximumFractionDigits: 2 });
    //     }
    // }

    const Stats = (): {title: string; value: string}[] => {
      switch (collection.collectionMinter?.minter_type) {
        case 'RANDOM':
          return [
            {
              title: 'Minter Type',
              value: collection.collectionMinter.minter_type.charAt(0) + collection.collectionMinter.minter_type.slice(1).toLowerCase(),
            },
            {
              title: 'Available',
              value: '69',
            },
            {
              title: 'Minted',
              value: '69',
            },
            {
              title: 'Royalties',
              value: '69%',
            },
          ]
          break;
        default: 
          return [];
          break;
      }
    }

    return (
      <>

      {/*  Collection Row */}
      {/* <div className='d-flex gap8' style={{height: '64px', marginBottom: '8px'}}>
        <Col className='tall square br8' xs="auto">
          <Link to={`/nfts/${collection.address}`}>
            <PlaceholdImg alt={collectionName} src={getApiUrl(`/public/${collection.collectionProfile.profile_image}`)} className='tall wide imgCover' />
          </Link>
        </Col>
        <Col className='card d-flex flex-row justify-content-between align-items-center'>
          <h2 className='ml16 d-none d-md-block'>{collectionName}</h2>
          <h4 className='ml16 d-md-none'>{collectionName}</h4>
          <div style={{paddingRight: '24px'}}  className='d-flex justify-content-between align-items-center'>
            <CollectionStats collection={collection} asks={fullCollection.asks} />
            <SocialLinks discord={collection.collectionProfile.discord} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} />
          </div>
        </Col>
      </div> */}

      {/* Main Row */}
      <div className='d-flex gap8 mb8 flex-wrap' style={{minWidth: 0}}>
        <Col xs={{span: 8, offset: 2}} md={{span: 6, offset: 0}} className={`br8 square`} style={{maxHeight: '630px'}}>
          <TokenImage alt={`${collectionName}`} src={collectionImage} className='tall wide imgCover' />
        </Col>

        {/* Accordian */}
        <Col xs={12} md={true} className={styles.accordionCol}>
          <div className={`${styles.accordionItem} ${styles.firstItem}`}>
            <div className='d-flex justify-content-between' style={{margin: '32px 32px 16px 32px', height: 'fit-content', width: 'calc(100% - 64px)'}}>
              <div>
                <div className='d-flex align-items-center mb16'>
                  <h1 className='mr8' style={{lineHeight: 1}}>{collectionName}</h1>
                  {(collection.categories || []).map(category=>
                    <Badge className='mr8' key={category}><span>{category}</span></Badge>
                  )}
                </div>
                <span className='lightText14'>Created by&nbsp;</span>
                <Link style={{overflow: "hidden"}} to={`/profile/${collection.creator}`}>
                  {truncateAddress(fullCollection.full_creator.display, process.env.REACT_APP_NETWORK_PREFIX)}
                </Link>
              </div>
              <div className='d-flex align-items-center'>
                <div className="d-flex align-items-stretch" style={{gap: '16px'}}>
                  <button onClick={handleFavorite} disabled={!!!user} className='clearBtn' style={{padding: 0, height: 'unset'}}>
                    <div className={styles.number}><img alt='' src={false ? '/red_heart.svg' : '/heart.svg'} style={{height: '1.3em'}} />&nbsp;0</div>
                    <span className={styles.label}>Favorites</span>
                  </button>
                  <Vr />
                  <div style={{marginRight: '32px'}}>
                    <div className={`${styles.number} d-flex align-items-center`}><img alt='' src='/eye.svg' style={{height: '1.3em'}} />&nbsp;0</div>
                    <span className={styles.label}>Views</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex flex-column' style={{flexGrow: 1 }} >
              { !!collection.collectionProfile.description &&
                <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                  <p style={{margin: '8px 0 0 0 ', fontSize: '14px', padding: '0 8px'}}>{collection.collectionProfile.description}</p>
                </div>
              }
              <div style={{margin: '0 48px 12px 48px', maxWidth: 'calc(100% - 96px)'}}>
                <div className='d-flex flex-wrap gap8' style={{margin: '0 8px', width: 'calc(100% - 16px)'}}>
                  {Stats().map(s=>(
                    <Col className={`${styles.detailCard} grayCard`} key={s.title}>
                      <span className={styles.type}>{s.title}</span>
                      <span className={styles.value}>{s.value}</span>
                    </Col>
                  ))}
                </div>
              </div>
              { !!(collection.traits && collection.traits.length) &&
                <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                  <div className='lightText12 mb8'>Unique Traits</div>
                  <div className='d-flex flex-wrap gap8' style={{margin: '0 8px', width: 'calc(100% - 16px)'}}>
                  {collection.traits.map(a=>{
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
            </div>
          </div>
        </Col>
      </div>

      {/* Mint Row */}
      <div className='card d-flex' style={{height: '84px', marginBottom: '8px'}}>
        <div style={{margin: '0 16px'}} className='d-flex align-items-center align-self-stretch justify-content-between wide'>
            <div className='d-flex align-items-center lightText justify-content-between'>
              <h2>{collectionName}</h2>
            </div>
            <div className='d-flex align-items-center' style={{gap: '24px'}}>
              {prices ?
                <div>
                  <div style={{fontSize: '28px'}}>{prices.displayAmount} <DenomImg denom={prices.denom} size='medium' /></div>
                  {!!prices.displayUsd && <div className='lightText12'>~ ${prices.displayUsd}</div>}
                </div>
              :
              <div>
                <Loader />
              </div>
              }

                  <button disabled={loadingTx} type='button' onClick={handleMint}>Mint now{loadingTx && <>&nbsp;<SmallLoader /></>}</button>
            </div>
            </div>
      </div>
    </>
    )
}

export default SingleMinter;