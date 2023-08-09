import { denomToHuman, epochToDate, findDenom, findToken, getMintLimit, getMintStatus, mintWithMinter, noDenom, truncateAddress, unknownDenom } from "@architech/lib";
import { cw721, GetCollectionResponse, Denom, minter, copyMinter, CollectionMinterI } from "@architech/types";
import { faCheck, faClock, faRefresh, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Countdown from "react-countdown";
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
import { getApiUrl, refreshCollection } from "../../Utils/backend";
import { calculatePrices, getPrice, Prices } from "../../Utils/data";
import { getCollectionName } from "../../Utils/helpers";
import { QueryClient } from "../../Utils/queryClient";
import sleep from "../../Utils/sleep";

import styles from './minter.module.scss';

type TimeStatus = { public: boolean, private: boolean, ended: boolean }

const getTimeStatus = (minter: CollectionMinterI): TimeStatus => {
  const getPublic = () => {
    if (!minter.launch_time) return true;
    if (epochToDate(minter.launch_time).valueOf() < new Date().valueOf()) return true;
    return false;
  }
  return {
    public: getPublic(),
    private: (()=>{
      if (!minter.whitelist_launch_time) return getPublic();
      if (epochToDate(minter.whitelist_launch_time).valueOf() < new Date().valueOf()) return true;
      return false;
    })(),
    ended: (()=>{
      if (!minter.end_time) return false;
      if (epochToDate(minter.end_time).valueOf() > new Date().valueOf()) return false;
      console.log('Minter has ended', minter.end_time, new Date())
      return true;
    })()
  }
}

const isMintingAvailable = (status: TimeStatus, whitelisted = false) => {
  if (status.ended) return false;
  if (status.public) return true;
  if (status.private && whitelisted) return true;
  return false;
}

const SingleMinter: FC<any> = (): ReactElement => {
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const { waitForMint } = useMint()
    const collection = fullCollection?.collection;

    const [loadingTx, setLoadingTx] = useState(false);
    const [prices, setPrices] = useState<Prices>();

    const [buyerStatus, setBuyerStatus] = useState<copyMinter.GetMintLimitResponse>();
    const [minterStatus, setMinterStatus] = useState<copyMinter.GetMintStatusResponse>();

    const { user, refreshProfile } = useUser()
    const revalidator = useRevalidator()

    const checkWhitelist = async () => {
      if (!user) return;
      if (!collection.collectionMinter) return;

      try {
        const result: minter.GetMintLimitResponse = await getMintLimit({ client: user.client, contract: collection.collectionMinter.minter_address, buyer: user.address });
        setBuyerStatus(result);
      } catch (error: any) {
        console.error('Failed to check buyer whitelist status:', error.toString())
        console.error(error)
        toast.error('Failed to check buyer whitelist status')
      }
    }

    const getMinterStatus = async () => {
      if (!collection.collectionMinter) return;

      try {
        const result: any = await getMintStatus({ client: QueryClient, contract: collection.collectionMinter.minter_address });
        setMinterStatus(result);
      } catch (error: any) {
        console.error('Failed to check minter status:', error.toString())
        console.error(error)
        toast.error('Failed to check minter status')
      }
    }

    useEffect(()=>{
      checkWhitelist();
      getMinterStatus();
    },[user])

    const handleRefresh = async () => {
      try {
          // setIsRefreshing(true);
          await refreshCollection(collection.address);
          await sleep(750)
          revalidator.revalidate()
      } catch (err: any) {
          console.error('Error refreshing collection:', err);
          toast.error(err.toString())
      } finally {
          // setIsRefreshing(false);
      }
  }

  const handleMint = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      if (!user) throw new Error('Wallet is not connected.')
      if (!collection.collectionMinter) throw new Error('Minter not found for this collection.')
      if (collection.collectionMinter.payment?.token || collection.collectionMinter.whitelist_payment?.token) throw new Error('Non-native payments are not supported.')
      if (!buyerStatus) throw new Error('Unable to fetch minter status.')
      if (buyerStatus.mint_limit && (buyerStatus.mints || 0 > buyerStatus.mint_limit)) throw new Error('You are at the mint limit for this collection.')
      setLoadingTx(true);

      if (buyerStatus.whitelisted) {
        console.log('Whitelist Mint')
        const result = await mintWithMinter({
          client: user.client,
          signer: user.address,
          minter_contract: collection.collectionMinter.minter_address,
          funds: collection.collectionMinter.whitelist_payment?.denom ?
            [{amount: collection.collectionMinter.whitelist_payment.amount, denom: collection.collectionMinter.whitelist_payment.denom}]
          : collection.collectionMinter.payment?.denom ?
            [{amount: collection.collectionMinter.payment.amount, denom: collection.collectionMinter.payment.denom}]
          :
            [],
        })
        console.log('Mint Result', result);
      } else {
        console.log('Public Mint')
        const result = await mintWithMinter({
          client: user.client,
          signer: user.address,
          minter_contract: collection.collectionMinter.minter_address,
          funds: collection.collectionMinter.payment?.denom ? [{amount: collection.collectionMinter.payment.amount, denom: collection.collectionMinter.payment.denom}] : [],
        })
        console.log('Mint Result', result);
      }

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

  const handleCalculatePrices = async() => {
    if (!collection.collectionMinter) return;
    setPrices(await calculatePrices(collection.collectionMinter))
  }

  // const calculatePrices = async () => {
  //   if (!collection.collectionMinter) return;

  //   const publicPrice: Price = await(async()=>{
  //     const payment = collection.collectionMinter?.payment

  //     let saleAmount: string = '--';
  //     let usdAmount: string = '--';
  //     let saleDenom: Denom = unknownDenom;

  //     if (!payment) {
  //       saleAmount = 'Free';
  //       usdAmount = '';
  //       saleDenom = noDenom;
  //     } else if (payment.token) {
  //       const denom = findToken(payment.token);
  //       if (denom) {
  //         saleDenom = denom;
  //         const num = denomToHuman(payment.amount, denom.decimals)
  //         saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
  //         usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  //       }
  //     } else if (payment.denom) {
  //       const denom = findDenom(payment.denom);
  //       if (denom) {
  //         saleDenom = denom;
  //         const num = denomToHuman(payment.amount, denom.decimals)
  //         saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
  //         usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  //       }
  //     }

  //     return { displayAmount: saleAmount, displayUsd: usdAmount, denom: saleDenom }
  //   })()

  //   const privatePrice: Price | undefined = await(async()=>{
  //     const payment = collection.collectionMinter?.whitelist_payment

  //     let saleAmount: string = '--';
  //     let usdAmount: string = '--';
  //     let saleDenom: Denom = unknownDenom;

  //     if (!payment) {
  //       return undefined;
  //     } else if (payment.token) {
  //       const denom = findToken(payment.token);
  //       if (denom) {
  //         saleDenom = denom;
  //         const num = denomToHuman(payment.amount, denom.decimals)
  //         saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
  //         usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  //       }
  //     } else if (payment.denom) {
  //       const denom = findDenom(payment.denom);
  //       if (denom) {
  //         saleDenom = denom;
  //         const num = denomToHuman(payment.amount, denom.decimals)
  //         saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
  //         usdAmount = (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  //       }
  //     }

  //     return { displayAmount: saleAmount, displayUsd: usdAmount, denom: saleDenom }
  //   })()

  //   setPrices({
  //     private: privatePrice,
  //     public: publicPrice,
  //   })
  // }

  useEffect(()=>{
    handleCalculatePrices()
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

  const timeStatus = getTimeStatus(collection.collectionMinter);
  const mintingAvailable = isMintingAvailable(timeStatus, buyerStatus?.whitelisted);

  const collectionName = getCollectionName(collection);
  const collectionImage = collection.collectionProfile?.profile_image ? getApiUrl(`/public/${collection.collectionProfile?.profile_image}`) : undefined;

  const startDate = collection.collectionMinter.launch_time ?
    epochToDate(collection.collectionMinter.launch_time)
  : undefined;

  const wlStartDate = collection.collectionMinter.whitelist_launch_time ?
    epochToDate(collection.collectionMinter.whitelist_launch_time)
  : undefined;

  const endDate = collection.collectionMinter.end_time ?
  epochToDate(collection.collectionMinter.end_time)
  : undefined;

  const Stats = (): {title: string; value: any}[] => {
    switch (collection.collectionMinter?.minter_type) {
      case 'RANDOM':
        return [
          {
            title: 'Minter Type',
            value: collection.collectionMinter.minter_type.charAt(0) + collection.collectionMinter.minter_type.slice(1).toLowerCase(),
          },
          {
            title: 'Available',
            //@ts-expect-error
            value: minterStatus?.remaining || <SmallLoader />,
          },
          {
            title: 'Minted',
            value: collection.totalTokens.toString(),
          },
          {
            title: 'Mint Limit',
            value: `${collection.collectionMinter.mint_limit} per User`,
          },
        ]
      case 'COPY':
        return [
          {
            title: 'Minter Type',
            value: collection.collectionMinter.minter_type.charAt(0) + collection.collectionMinter.minter_type.slice(1).toLowerCase(),
          },
          {
            title: 'Available',
            value: minterStatus ? minterStatus.max_copies || 'Unlimited' : <SmallLoader />,
          },
          {
            title: 'Minted',
            value: minterStatus ? minterStatus.minted : <SmallLoader />,
          },
          {
            title: 'Mint Limit',
            value: collection.collectionMinter.mint_limit ? `${collection.collectionMinter.mint_limit} per User` : 'Unlimited',
          },
        ]
      default: 
        return [];
    }
  }

  return (
    <>

    {/* Main Row */}
    <div className='d-flex gap8 mb8 flex-wrap' style={{minWidth: 0}}>
      <Col xs={{span: 8, offset: 2}} md={{span: 5, offset: 0}} className={`br8 square`} style={{maxHeight: '630px'}}>
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
              {/* <div className="d-flex align-items-stretch" style={{gap: '16px'}}>
                <button onClick={handleFavorite} disabled={!!!user} className='clearBtn' style={{padding: 0, height: 'unset'}}>
                  <div className={styles.number}><img alt='' src={false ? '/red_heart.svg' : '/heart.svg'} style={{height: '1.3em'}} />&nbsp;0</div>
                  <span className={styles.label}>Favorites</span>
                </button>
                <Vr />
                <div style={{marginRight: '32px'}}>
                  <div className={`${styles.number} d-flex align-items-center`}><img alt='' src='/eye.svg' style={{height: '1.3em'}} />&nbsp;0</div>
                  <span className={styles.label}>Views</span>
                </div>
              </div> */}
              <FontAwesomeIcon icon={faRefresh} onClick={()=>handleRefresh()} size={"2x"} />
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
          <div style={{padding: '32px'}} className='d-flex flex-column gap8'>
            {!!collection.collectionMinter.whitelist_launch_time &&
              <SaleTimeRow
                saleType='Private'
                startTime={wlStartDate}
                endTime={endDate}
                endCountdown={false}
                price={!prices ? <SmallLoader />
                  : prices.private ?
                    <div style={{fontSize: '28px'}}>{prices.private.displayAmount} <DenomImg denom={prices.private.denom} size='medium' /></div>
                  :
                    <div style={{fontSize: '28px'}}>{prices.public.displayAmount} <DenomImg denom={prices.public.denom} size='medium' /></div>
                }
                eligible={buyerStatus?.whitelisted || false}
              />
            }
            {!!collection.collectionMinter.launch_time &&
              <SaleTimeRow
                saleType='Public'
                startTime={startDate}
                endTime={endDate}
                endCountdown={true}
                price={prices?.public.displayAmount ?
                  <div style={{fontSize: '28px'}}>{prices.public.displayAmount} <DenomImg denom={prices.public.denom} size='medium' /></div>
                  : <SmallLoader />
                }
              />
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
              prices.private && buyerStatus?.whitelisted ?
              <div>
                <div style={{fontSize: '28px'}}>{prices.private.displayAmount} <DenomImg denom={prices.private.denom} size='medium' /></div>
                {!!prices.private.displayUsd && <div className='lightText12'>~ ${prices.private.displayUsd}</div>}
              </div>
              :
              <div>
                <div style={{fontSize: '28px'}}>{prices.public.displayAmount} <DenomImg denom={prices.public.denom} size='medium' /></div>
                {!!prices.public.displayUsd && <div className='lightText12'>~ ${prices.public.displayUsd}</div>}
              </div>
            :
            <div>
              <Loader />
            </div>
            }
              <button
                disabled={loadingTx || !mintingAvailable}
                type='button'
                onClick={handleMint}
              >
                { mintingAvailable ?
                  <>Mint now{loadingTx && <>&nbsp;<SmallLoader /></>}</>
                : timeStatus.ended ?
                  'Ended'
                :
                  'Minting soon'
                }
              </button>
          </div>
          </div>
    </div>
  </>
  )
}


// Random component
const Completionist = () => <span>You are good to go!</span>;

// Renderer callback with condition
const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    // Render a completed state
    return <Completionist />;
  } else {
    // Render a countdown
    return <span>{hours}d {hours}h {minutes}m {seconds}s</span>;
  }
};

type TimeRowProps = {
  saleType: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  endCountdown?: boolean;
  ended?: boolean;
  price: any;
  eligible?: boolean;
}

const SaleTimeRow: FC<TimeRowProps> = ({saleType, startTime, endTime, endCountdown = true, ended, price, eligible = true}): ReactElement => {
  const [now, setNow] = useState(new Date())

  let status;
  let icon;

  if (ended || (endTime && now > endTime)){
    status = 'Ended';
    icon = faX;
  } else if (startTime && now < startTime){
    status = <Countdown
      date={startTime}
      renderer={renderer}
      onComplete={()=>setNow(new Date())}
    />;
    icon = faClock;
  } else if (endTime && endCountdown){
    status = <Countdown
      date={endTime}
      renderer={renderer}
      onComplete={()=>setNow(new Date())}
    />;
    icon = faCheck;
  } else if (eligible) {
    status = 'Active';
    icon = faCheck;
  } else {
    status = 'Not Eligible';
    icon = faX;
  }
  
  return (
    <div className='d-flex br8 align-items-center' style={{background: '#DDD', padding: '8px 16px'}}>
      <FontAwesomeIcon icon={icon} size='2x' className='mr16' />
      <div>
        <div className='lightText12'>{saleType} Mint</div>
        <div>{price}</div>
      </div>
      <h3 style={{marginLeft: 'auto'}}>{status}</h3>
    </div>
  )
}

export default SingleMinter;