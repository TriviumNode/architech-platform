import { denomToHuman, epochToDate, findDenom, findToken, getConfig, getMintLimit, getMintStatus, mintWithMinter, noDenom, parseError, truncateAddress, unknownDenom } from "@architech/lib";
import { cw721, GetCollectionResponse, Denom, minter, copyMinter, CollectionMinterI, cw2981 } from "@architech/types";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import { CodeDetails, Contract } from "@cosmjs/cosmwasm-stargate";
import { faCheck, faChevronRight, faClock, faRefresh, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Countdown from "react-countdown";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import { DenomImg } from "../../Components/ArchDenom";
import Badge from "../../Components/Badge";
import HiddenBanner from "../../Components/HiddenBanner/HiddenBanner";
import Loader from "../../Components/Loader";
import MintModal from "../../Components/Modals/MintModal";
import RefreshButton from "../../Components/RefreshButton";
import SmallLoader from "../../Components/SmallLoader";
import TokenImage from "../../Components/TokenImg";
import VerifiedBadge from "../../Components/Verified";
import Vr from "../../Components/vr";
import { useMint } from "../../Contexts/MintContext";
import { useUser } from "../../Contexts/UserContext";
import { DevInfo } from "../../Interfaces/interfaces";
import { getApiUrl, refreshCollection } from "../../Utils/backend";
import { calculatePrices, getPrice, Prices } from "../../Utils/data";
import { getCollectionName } from "../../Utils/helpers";
import { NoisQueryClient, NOIS_PAYMENT_CONTRACT, QueryClient, RANDOMNESS_COST } from "../../Utils/queryClient";
import sleep from "../../Utils/sleep";
import { queryPaymentContractBalance } from "../../Utils/wasm/proxyQuery";

import styles from './minter.module.scss';

type TimeStatus = { public: boolean, private: boolean, ended: boolean }

const getTimeStatus = (minter: CollectionMinterI, now: Date): TimeStatus => {
  const getPublic = () => {
    if (!minter.launch_time) return true;
    if (epochToDate(minter.launch_time).valueOf() < now.valueOf()) return true;
    return false;
  }
  return {
    public: getPublic(),
    private: (()=>{
      if (!minter.whitelist_launch_time) return getPublic();
      if (epochToDate(minter.whitelist_launch_time).valueOf() < now.valueOf()) return true;
      return false;
    })(),
    ended: (()=>{
      if (!minter.end_time) return false;
      if (epochToDate(minter.end_time).valueOf() > now.valueOf()) return false;
      console.log('Minter has ended', minter.end_time, now)
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

// Queries NOIS payment contract to ensure enough funds.
export const isRandomnessReady = async () => {
  try {
    const balance = await queryPaymentContractBalance({
      client: NoisQueryClient,
      address: NOIS_PAYMENT_CONTRACT
    });
    const minimum = RANDOMNESS_COST * 5;
    
    console.log(`Randomness Balance: ${balance}\nRandomness Minimum: ${minimum}\nRandomness Cost: ${RANDOMNESS_COST}`)
    if (balance < minimum) {
      // console.error(`Randomness Balance: ${balance}\nRandomness Minimum: ${minimum}\nRandomness Cost: ${RANDOMNESS_COST}`)
      throw new Error('Randomness payment contract has insufficent funds. Please contract Architech support.')
    }
  } catch(e: any) {
    if (e.toString().includes('has insufficent funds')) throw e;
    else {
      console.error(`Unable to verify randomness contract:\n`, e);
      throw new Error(`Unable to verify randomness contract: ${e.toString()}`)
    }
  }
}

const SingleMinter: FC<any> = (): ReactElement => {
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const { waitForMint } = useMint()
    const collection = fullCollection?.collection;

    const [activeItem, setActiveItem] = useState('item1')

    const [loadingTx, setLoadingTx] = useState(false);
    const [prices, setPrices] = useState<Prices>();

    const [buyerStatus, setBuyerStatus] = useState<copyMinter.GetMintLimitResponse>();
    const [minterStatus, setMinterStatus] = useState<copyMinter.GetMintStatusResponse>();
    const [copyMetadata, setCopyMetadata] = useState<cw2981.Metadata>();
    const [devInfo, setDevInfo] = useState<DevInfo>()
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);

    const [now, setNow] = useState(new Date())

    const { user, refreshProfile, devMode, refreshBalances } = useUser()
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

    const queryMinter = async () => {
      if (!collection.collectionMinter) return;

      try {
        const status: any = await getMintStatus({ client: QueryClient, contract: collection.collectionMinter.minter_address });
        setMinterStatus(status);

        const {config} = await getConfig({client: QueryClient, contract: collection.collectionMinter.minter_address})
        setCopyMetadata(config.metadata)

        const contract = await QueryClient.getContract(collection.collectionMinter.minter_address)
        const code = await QueryClient.getCodeDetails(contract.codeId)
        const metadata = await QueryClient.getContractMetadata(collection.collectionMinter.minter_address)
        const premium = await QueryClient.getContractPremium(collection.collectionMinter.minter_address)
        setDevInfo({contract, code, metadata, premium})

      } catch (error: any) {
        console.error('Failed to check minter status:', error.toString())
        console.error(error)
        toast.error('Failed to check minter status')
      }
    }

    useEffect(()=>{
      checkWhitelist();
      queryMinter();
    },[user])

    const handleRefresh = async () => {
      try {
          setIsRefreshing(true);
          await refreshCollection(collection.address);
          await sleep(750)
          revalidator.revalidate()
      } catch (err: any) {
          console.error('Error refreshing collection:', err);
          toast.error(parseError(err))
      } finally {
          setIsRefreshing(false);
      }
  }

  const handleMint = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      if (!user) throw new Error('Wallet is not connected.')
      if (!collection.collectionMinter) throw new Error('Minter not found for this collection.')
      if (collection.collectionMinter.payment?.token || collection.collectionMinter.whitelist_payment?.token) throw new Error('Non-native payments are not supported.')
      if (!buyerStatus) throw new Error('Unable to fetch minter status.')
      if (buyerStatus.mint_limit && ((buyerStatus.mints || 0) > buyerStatus.mint_limit)) throw new Error('You are at the mint limit for this collection.')

      if (
        collection.collectionMinter.minter_type === 'RANDOM'
        && (!buyerStatus.mint_limit || buyerStatus.mint_limit > 1)
      ) {
        setModalOpen(true);
        return;
      }

      setLoadingTx(true);

      // Query NOIS payment contract to ensure enough funds.
      await isRandomnessReady()

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
      refreshBalances();

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
      checkWhitelist();
      queryMinter();
      revalidator.revalidate();
    } catch(err: any) {
      console.error(err)
      toast.error(parseError(err))
    } finally {
      setLoadingTx(false);
    }
  }

  const onMint = () => {
    checkWhitelist();
    queryMinter();
    revalidator.revalidate();
  }

  const handleCalculatePrices = async() => {
    if (!collection.collectionMinter) return;
    setPrices(await calculatePrices(collection.collectionMinter))
  }

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

  const timeStatus = getTimeStatus(collection.collectionMinter, now);
  const mintingAvailable = isMintingAvailable(timeStatus, buyerStatus?.whitelisted);

  const collectionName = getCollectionName(collection);

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
            value: minterStatus !== undefined ? minterStatus.remaining - minterStatus.pending || 0 : <SmallLoader />,
          },
          {
            title: 'Minted',
            //@ts-expect-error
            value: minterStatus !== undefined ? (collection.totalTokens + minterStatus?.pending || 0).toString() : <SmallLoader />,
            // value: (collection.totalTokens + minterStatus?.pending || 0).toString(),
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

  const collectionImage = (()=>{
    if (collection.collectionMinter?.minter_type === 'COPY' && copyMetadata?.image) return copyMetadata.image;
    if (collection.collectionProfile?.profile_image) return getApiUrl(`/public/${collection.collectionProfile?.profile_image}`)
    return undefined;
  })()

  return (
    <>

    <MintModal
      open={modalOpen}
      onClose={()=>setModalOpen(false)}
      prices={prices}
      buyerStatus={buyerStatus}
      minterStatus={minterStatus as any}
      collection={collection}
      onMint={onMint}
    />
  
    {!!collection.hidden &&
      <HiddenBanner page='MINTER' collectionAddress={collection.address} />
    }

    {/* Main Row */}
    <div className='d-flex gap8 mb8 flex-wrap' style={{minWidth: 0}}>
      <Col xs={{span: 8, offset: 2}} md={{span: 5, offset: 0}} className={`br8 square`} style={{maxHeight: '630px'}}>
        <TokenImage alt={`${collectionName}`} src={collectionImage} className='tall wide imgCover' />
      </Col>

      {/* Accordian */}
      <Col xs={12} md={true} className={styles.accordionCol}>
        <div className={`${styles.accordionItem} ${styles.firstItem} ${activeItem === 'item1' && styles.activeItem}`} onClick={()=>setActiveItem('item1')} >
          <div className='d-flex justify-content-between' style={{margin: '32px 32px 16px 32px', height: 'fit-content', width: 'calc(100% - 64px)'}}>
            <div>
              <div className='d-flex align-items-center mb16'>
                <h1 className='mr8' style={{lineHeight: 1}}>{collectionName}</h1>
                {!!collection.verified &&
                  <VerifiedBadge content="Collection" />
                }
                {(collection.categories || []).map(category=>
                  <Badge className='mr8' key={category}><span>{category}</span></Badge>
                )}
              </div>
              <span className='lightText14'>Created by&nbsp;</span>
              <Link style={{overflow: "hidden"}} to={`/profile/${fullCollection.full_creator.address}`}>
                {truncateAddress(fullCollection.full_creator.display, process.env.REACT_APP_NETWORK_PREFIX)}
              </Link>
            </div>
            <div className='d-flex align-items-center'>
              <RefreshButton refreshWhat="Minter" spin={isRefreshing} disabled={isRefreshing} onClick={()=>handleRefresh()} />
            </div>
          </div>

          {/* ### Dev Mode Info ### */}
          {devMode && 
          <>
            {!!devInfo ?
              <div>
                Code ID: {devInfo.contract.codeId}&nbsp;&nbsp;&nbsp;&nbsp;Hash: {devInfo.code.checksum}<br/>
                Premium:&nbsp;
                <code>
                  {JSON.stringify(devInfo.premium?.flatFee,undefined,2)}
                </code>
                <br/>
                Metadata:<br/>
                <code>
                  {JSON.stringify(devInfo.metadata,undefined,2)}
                </code>
              </div>
            :
              <SmallLoader />  
            }
          </>  
          }


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
            {/* { !!(collection.traits && collection.traits.length) &&
              <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                <div className='lightText12 mb8'>Unique Traits</div>
                <div className='d-flex flex-wrap gap8' style={{margin: '0 8px', width: 'calc(100% - 16px)'}}>
                {collection.traits.map((a, i)=>{
                  return (
                    <div className={`${styles.trait} grayCard`} key={i}>
                      <span className={styles.type}>{a.trait_type}</span>
                      <hr />
                      <span className={styles.value}>{a.value}</span>
                    </div>
                  )
                })}
                </div>
              </div>
            } */}
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
                now={now}
                onComplete={()=>setNow(new Date())}
              />
            }
            {(
              // if has a launch time
              !!collection.collectionMinter.launch_time
              // or public mint is open and has an end time
              || (timeStatus.public && collection.collectionMinter.end_time)
            ) &&
              <SaleTimeRow
                saleType='Public'
                startTime={startDate}
                endTime={endDate}
                endCountdown={true}
                price={prices?.public.displayAmount ?
                  <div style={{fontSize: '28px'}}>{prices.public.displayAmount} <DenomImg denom={prices.public.denom} size='medium' /></div>
                  : <SmallLoader />
                }
                now={now}
                onComplete={()=>setNow(new Date())}
              />
            }

          </div>
        </div>

        { copyMetadata !== undefined &&
          <div className={`${styles.accordionItem} ${activeItem === 'item2' && styles.activeItem}`} >
            <div className='d-flex justify-content-between pointer' style={{margin: '32px 32px 16px 32px', height: 'fit-content', width: 'calc(100% - 64px)'}} onClick={()=>setActiveItem(activeItem === 'item2' ? 'item1' : 'item2')}>
              <div className='d-flex align-items-center mb16 wide justify-content-between'>
                <h2 className='mr8' style={{lineHeight: 1}}>NFT Details</h2>
                <div className='d-flex align-items-center'>
                  <FontAwesomeIcon icon={faChevronRight} className={activeItem === 'item2' ? styles.activeIcon : undefined} />
                </div>
              </div>
            </div>
            <div className='d-flex flex-column' >
                { !!copyMetadata.description &&
                  <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                    <span className='lightText12'>Description</span>
                    <p style={{margin: '8px 0 0 0 ', fontSize: '12px', padding: '0 8px'}}>{copyMetadata.description}</p>
                  </div>
                }
                { !!(copyMetadata.attributes && copyMetadata.attributes.length) &&
                  <div style={{margin: '0 48px 12px 48px', width: 'fit-content', maxWidth: 'calc(100% - 96px)'}}>
                    <div className='lightText12 mb8'>Traits</div>
                    <div className='d-flex flex-wrap gap8' style={{margin: '0 8px', width: 'calc(100% - 16px)'}}>
                    {copyMetadata.attributes.map((a, i)=>{
                      return (
                        <div className={`${styles.trait} grayCard`} key={i}>
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
        }
      </Col>
    </div>

    {/* Mint Row */}
    <div className='card d-flex' style={{height: '84px', marginBottom: '8px'}}>
      <div style={{margin: '0 16px'}} className='d-flex align-items-center align-self-stretch justify-content-between wide'>
          <div className='d-flex align-items-center lightText justify-content-between'>
            <h2>{collection.collectionMinter.minter_type} Mint&nbsp;&nbsp;-&nbsp;&nbsp;{collectionName}</h2>
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
                disabled={loadingTx || !mintingAvailable || collection.collectionMinter.minting_disabled}
                type='button'
                onClick={handleMint}
              >
                { collection.collectionMinter.minting_disabled ?
                  'Minting Paused'
                : mintingAvailable ?
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
  // if (completed) {
    // Render a completed state
    // return <Completionist />;
  // } else {
    // Render a countdown
    return <span>{days}<h6 className='d-inline'>d</h6> {hours}<h6 className='d-inline'>h</h6> {minutes}<h6 className='d-inline'>m</h6> {seconds}<h6 className='d-inline'>s</h6></span>;
  // }
};

const endRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <div>
      <h5 style={{color: '#666666', marginBottom: 0}}>Ends in</h5>
      <h3>
        {days}<h6 className='d-inline'>d</h6>&nbsp;
        {hours}<h6 className='d-inline'>h</h6>&nbsp;
        {minutes}<h6 className='d-inline'>m</h6>&nbsp;
        {seconds}<h6 className='d-inline'>s</h6>
      </h3>
    </div>
  );
};

type TimeRowProps = {
  saleType: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  endCountdown?: boolean;
  ended?: boolean;
  price: any;
  eligible?: boolean;
  now: Date;
  onComplete: ()=>void;
}

const SaleTimeRow: FC<TimeRowProps> = ({saleType, startTime, endTime, endCountdown = true, ended, price, eligible = true, now, onComplete}): ReactElement => {
  let status;
  let icon;

  if (ended || (endTime && now > endTime)){
    status = 'Ended';
    icon = faX;
  } else if (startTime && now < startTime){
    status = <Countdown
      date={startTime}
      renderer={renderer}
      onComplete={onComplete}
    />;
    icon = faClock;
  } else if (endTime && endCountdown){
    status = <Countdown
      date={endTime}
      renderer={endRenderer}
      onComplete={onComplete}
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