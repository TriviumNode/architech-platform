import {ReactElement, FC, useState, useEffect, memo} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import CollectionDetailPage, { DetailState } from "./CollectionSubPages/CollectionDetailPage";
import { editCollection, uploadBatch } from "../../Utils/backend";
import LinksPage, { LinkState } from "./CollectionSubPages/LinksPage";
import { cw2981, GetCollectionResponse, minter } from "@architech/types";
import { toast } from "react-toastify";
import equal from "fast-deep-equal";
import RewardsPage, { DefaultRewardsState, RewardsState } from "./CollectionSubPages/RewardsPage";
import { ADMINS, getMetadata, getMintStatus, parseError, preloadData, setLaunchTime, setRewardsMetadata } from "@architech/lib";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import ConnectWallet from "../../Components/ConnectWallet";
import MinterPreloadPage, { DefaultPreloadState, PreloadState } from "./CollectionSubPages/MinterPreloadPage";

import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {Buffer} from 'buffer';
import ModalV2 from "../../Components/ModalV2";
import Loader from "../../Components/Loader";
import { AxiosProgressEvent } from "axios";
import AdminEditPage from "./CollectionSubPages/AdminEditPage";
import TimesPage, { DefaultTimesState, TimesState } from "./CollectionSubPages/TimesPage";



// export type Page = 'Details' | 'Rewards' | 'Links'
export type Page = {
    link: string;
    title: string;
}

export const PAGES: Page[] = [
    {
        link: 'details',
        title: 'Details',
    },
    {
        link: 'links',
        title: 'Links',
    },
    {
        link: 'rewards',
        title: 'Rewards',
    },
]

export const MinterPAGES: Page[] = [
  {
      link: 'launchtime',
      title: 'Launch Time',
  },
]

export const RandomPAGES: Page[] = [
    ...PAGES,
    ...MinterPAGES,
    {
        link: 'preload',
        title: 'Preload Minter',
    },
]

export const CopyPAGES: Page[] = [
  ...PAGES,
  ...MinterPAGES,
]

export type PreloadStatus = 'PROCESSING' | 'UPLOADING' | 'WAITING_SIGN' | 'WAITING_TX' | 'COMPLETE' | 'ERROR'

const EditCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const navigate = useNavigate();
    const params = useParams()

    const [Pages, setPages] = useState<Page[]>(fullCollection.collection.collectionMinter?.minter_type === 'RANDOM' ? RandomPAGES : fullCollection.collection.collectionMinter?.minter_type === 'COPY' ? CopyPAGES : PAGES);

    const findPage = Pages.find(p=>p.link.toLowerCase() === params.page?.toLowerCase()) || Pages[0]

    
    const revalidator = useRevalidator();
    const {collection} = fullCollection;

    const currentDetail = {
      categories: fullCollection.collection.categories,
      description: collection.collectionProfile.description || '',
      name: collection.collectionProfile.name || '',
      symbol: collection.cw721_symbol,
      hidden: collection.hidden,
    }
    
    const currentLinks = {
      discord: collection.collectionProfile.discord || '',
      telegram: collection.collectionProfile.telegram || '',
      twitter: collection.collectionProfile.twitter || '',
      website: collection.collectionProfile.website || '',
    }

    const currentTimes: TimesState = {
      ...DefaultTimesState,
      launch_time: collection.collectionMinter?.launch_time ? new Date(parseInt(collection.collectionMinter.launch_time) * 1000) : undefined,
      whitelist_launch_time: collection.collectionMinter?.whitelist_launch_time ? new Date(parseInt(collection.collectionMinter.whitelist_launch_time) * 1000) : undefined,
    }

    const [detailState, setDetailState] = useState<DetailState>(currentDetail);
    const [linkState, setLinkState] = useState<LinkState>(currentLinks);
    const [rewardsState, setRewardsState] = useState<RewardsState>(DefaultRewardsState);
    const [preloadState, setPreloadState] = useState<PreloadState>(DefaultPreloadState);
    const [timesState, setTimesState] = useState<TimesState>(currentTimes);

    const [page, setPage] = useState<Page>(findPage)

    const [unsaved, setUnsaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preloadStatus, setPreloadStatus] = useState<PreloadStatus>();
    const [preloadReady, setPreloadReady] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);
    
    const [preloadError, setPreloadError] = useState<any>();

    const [metadata, setMetadata] = useState<ContractMetadata>()
    const [loadingMetadata, setLoadingMetadata] = useState(true)
    const [loadMetadataError, setLoadMetadataError] = useState<string>();

    const [minterStatus, setMinterStatus] = useState<minter.GetMintStatusResponse>()

    const [popupError, setPopupError] = useState<any>();

    useEffect(()=>{
      if (ADMINS.includes(wallet?.address || 'notadmin') && Pages.findIndex(p=>p.link === 'admin') === -1 ) Pages.push({ link: 'admin', title: 'Admin' })
    },[wallet])
    const changePage = (newLink: string) => {
        setPage(Pages.find(p=>p.link===newLink) as Page);
    }

    useEffect(()=>{
        refreshMetadata();
    },[QueryClient])

    useEffect(()=>{
      if (!collection.collectionMinter) return;
      const newTimesState = {...timesState}
      if (collection.collectionMinter.launch_time){
        newTimesState.launch_time = new Date(parseInt(collection.collectionMinter.launch_time) * 1000)
      }
      if (collection.collectionMinter.whitelist_launch_time){
        newTimesState.whitelist_launch_time = new Date(parseInt(collection.collectionMinter.whitelist_launch_time) * 1000)
      }
      setTimesState(newTimesState)
    },[collection])

    const refreshMetadata = async() => {
        if (!QueryClient) return;
        setLoadingMetadata(true);
        try {
            const metadata = await getMetadata({
                client: QueryClient,
                contract: collection.address
            });
            setMetadata(metadata);
        } catch (err: any) {
            if (!err.toString().includes('metadata for the contract: not found: key not found')) {
                console.error('Error loading metadata', err)
                setLoadMetadataError(`Error Fetching: ${err.toString()}`)
            }
        } finally {
            setLoadingMetadata(false);
        }
    }
      
    // Effect to check for unsaved changes
    useEffect(()=>{
      if (
        (!equal(currentDetail, detailState) || !equal(currentLinks, linkState))
        || rewardsState.address
      ){
        setUnsaved(true);
      } else if (!equal(currentTimes.launch_time, timesState.launch_time)) {
        console.log('Launch Time is unsaved!', currentTimes.launch_time, timesState.launch_time)
        setUnsaved(true);
      } else if (!equal(currentTimes.whitelist_launch_time, timesState.whitelist_launch_time)) {
        console.log('Whitelist Launch Time is unsaved!', currentTimes.whitelist_launch_time, timesState.whitelist_launch_time)
        setUnsaved(true);
      }
      else {
        setUnsaved(false)
      }
    },[detailState, linkState, rewardsState, timesState])

    // Effect to error check preloading
    useEffect(()=>{
        // Skip if no items are uploaded
        if (!preloadState.items.length) {
            setPreloadReady(false);
            return;
        }

        const invalidFiles = preloadState.images.filter(image=>{
            if (preloadState.items.findIndex(item=>item.file_name === image.file.name) === -1) {
                return image;
            }
        })
        const invalidFileNames = invalidFiles.map(f=>f.file.name);
        setPreloadState({...preloadState, invalidFiles: invalidFileNames})
        if (invalidFiles.length) {
            setPopupError(`Image ${invalidFiles[0].file.name} does not match any of the uploaded items.`)
            setPreloadReady(false);
            // Stop checking after finding one error.
            return;
        }
        // for (let i=0; i<preloadState.images.length; i++){
        //     let image = preloadState.images[i]

        //     // Show an error if an uploaded image does not have a matching item
        //     if (preloadState.items.findIndex(item=>item.file_name === image.file.name) === -1) {
        //         setPopupError(`Image ${image.file.name} does not match any of the uploaded items.`)
        //         setPreloadReady(false);
        //         // Stop checking after finding one error.
        //         return;
        //     }
        // }

        // Get items with no image URL specified (items that need the image uploaded)
        const noImages = preloadState.items.filter(i=>!i.image)
        if (noImages.length) {
            for (let i=0; i<noImages.length; i++){
                let noImage = noImages[i]

                // Show an error if an item with no URL doesnt have an image uploaded
                if (preloadState.images.findIndex(image=>image.file.name === noImage.file_name) === -1) {
                    setPopupError(`File ${noImages[i].file_name} is missing.`)
                    setPreloadReady(false);
                    // Stop checking after finding one error.
                    return;
                }

            }
        }

        // Clear error if no errors were found.
        setPopupError(undefined);
        setPreloadReady(true);
    },[preloadState.items, preloadState.images])

    const queryMinter = async () => {
      if (!collection.collectionMinter) return;
      setMinterStatus(undefined);
      try {
        const status = await getMintStatus({ client: QueryClient, contract: collection.collectionMinter.minter_address });
        setMinterStatus(status);
      } catch (error: any) {
        console.error('Failed to check minter state:', error.toString())
        console.error(error)
        toast.error('Failed to check minter status')
      }
    }

    useEffect(()=>{
      queryMinter();
    },[collection.collectionMinter])

    const handleDetailChange = (data: DetailState) => {
        setDetailState(data)
    }

    const getPage = () => {
        switch(true) {
            case page.link==='details':
                return <CollectionDetailPage current={currentDetail} state={detailState} isEditing={true} onChange={handleDetailChange} next={()=>changePage('Links')} />
            case page.link==='links':
                return <LinksPage state={linkState} onChange={(newState) => setLinkState(newState)} next={()=>changePage('Rewards')} />
            case page.link==='rewards':
                return <RewardsPage state={rewardsState} onChange={(data) => setRewardsState(data)} contractAddress={collection.address} metadata={metadata} loadingMetadata={loadingMetadata} loadingMetadataError={loadMetadataError} />
            case page.link==='preload':
                return <MinterPreloadPage state={preloadState} onChange={(data) => setPreloadState(data)} minterStatus={minterStatus} />
            case page.link==='launchtime':
              return <TimesPage state={timesState} onChange={(data) =>setTimesState(data)} collectionType={collection.collectionMinter?.minter_type} collectionMinter={collection.collectionMinter} />
            case page.link==='admin':
              return <AdminEditPage collection={fullCollection.collection}  />
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!wallet) throw new Error('Wallet is not connected.');
            if (!equal(currentDetail, detailState) || !equal(currentLinks, linkState)){
                const importData: ImportCollectionData = {
                    ...detailState,
                    ...linkState,
                }
                const response = await editCollection(collection._id.toString(), importData);
                revalidator.revalidate();
                setUnsaved(false);
                toast.success('Saved collection profile')
            } else if (rewardsState.address && rewardsState.address !== metadata?.rewardsAddress) {
                const result = await setRewardsMetadata({
                    client: wallet.client,
                    signer: wallet.address,
                    contract: fullCollection.collection.address,
                    rewards_address: rewardsState.address,
                })
                console.log('TX Result', result);
                refreshMetadata();
                setUnsaved(false);
                toast.success('Saved rewards address');
            }

            if (!equal(currentTimes.launch_time, timesState.launch_time) || !equal(currentTimes.whitelist_launch_time, timesState.whitelist_launch_time)) {
              if (!fullCollection.collection.collectionMinter) throw new Error('Attempting to edit launch time on a non-minter collection.')
              const editTimeResult = await setLaunchTime({
                client: wallet.client,
                signer: wallet.address,
                minter_contract: fullCollection.collection.collectionMinter.minter_address,
                launch_time: timesState.launch_time !== currentTimes.launch_time ? timesState.launch_time : undefined,
                whitelist_launch_time: timesState.whitelist_launch_time !== currentTimes.whitelist_launch_time ? timesState.whitelist_launch_time : undefined,
              })
              console.log('Edit Launch Time TX Result:', editTimeResult);
              setUnsaved(false);
              toast.success('Saved launch times')
            }
            refreshProfile()
        } catch(err: any) {
            toast.error(err.toString())
            console.error(err)
        } finally {
            setSaving(false);
        }
    }

    const handleCancel = (e: any) => {
      if (e) e.preventDefault();
      setDetailState(currentDetail);
      setLinkState(currentLinks);
      setTimesState(currentTimes);
    }

    const handleProgress = (progressEvent: AxiosProgressEvent) => {
      const percent = Math.ceil((progressEvent.progress || 0) * 100);
      setUploadPercent(percent);
      if (percent === 100) setPreloadStatus('PROCESSING');
    }

    const handlePreload = async() => {
        if (!wallet) throw new Error('Wallet is not connected.');
        if (!fullCollection.collection.collectionMinter) throw new Error(`This collection doesn't have a Minter.`);
        setPreloadStatus('UPLOADING');
        try {
            const uploadResult = await uploadBatch(preloadState.images.map(i=>i.file), handleProgress);
            setPreloadStatus('PROCESSING');
            const cleanMetadata: cw2981.Metadata[] = preloadState.items.map(i=>{
                if (!i.image) {
                    const findImg = uploadResult.find((r: any)=>r.fileName === i.file_name);
                    if (!findImg) throw new Error(`Unable to find filename ${i.file_name} in upload result.`)
                    const metadata: cw2981.Metadata = {
                        ...{...i, file_name: undefined},
                        royalty_percentage: i.royalty_percentage ? parseInt(i.royalty_percentage.toString()) : undefined,
                        image: `ipfs://${findImg.cid}`,
                    }
                    return metadata;
                } else return {
                    ...{...i, file_name: undefined},
                    royalty_percentage: i.royalty_percentage ? parseInt(i.royalty_percentage.toString()) : undefined,
                };
            })

            setPreloadStatus('WAITING_SIGN');
            const result = await preloadData({
                client: wallet.client,
                signer: wallet.address,
                contract: fullCollection.collection.collectionMinter?.minter_address as string,
                metadata: cleanMetadata,
            })
            console.log('Preload TX Result', result);
            queryMinter()
            setPreloadStatus('COMPLETE')
        } catch(err: any) {
            console.error(err);
            setPreloadError(parseError(err))
            setPreloadStatus('ERROR');
        }
        setUploadPercent(0);
    }

    const handleCompleteClose = () => {
      setPreloadState(DefaultPreloadState);
      setPreloadStatus(undefined);
    }

    const getStatusMessage = () => {
      switch (preloadStatus) {
        case "UPLOADING":
          return (
            <>
              <h3 className='mb8'>Uploading</h3>
              <div className='lightText14'>
                {uploadPercent}%
              </div>
              <Loader />
            </>
          );
        case "PROCESSING":
          return (
            <>
              <h3>Processing</h3>
              <Loader />
            </>
          );
        case "WAITING_SIGN":
          return (
            <>
              <div style={{fontSize: '16px'}}>Please sign the transaction with your wallet</div>
              <Loader />
            </>
          );
        case "COMPLETE":
          return (
            <>
              <h3>Success</h3>
              <p className='lightText12'>Preloaded {preloadState.items.length} NFTs</p>
              <button onClick={()=>handleCompleteClose()}>Close</button>
            </>
          );
        case "ERROR":
          return (
            <>
              <h3 className='mb8'>Error</h3>
              <code className='mb16'>{preloadError}</code>
              <button onClick={()=>setPreloadStatus(undefined)}>Close</button>
            </>
          );
      }
    }



    if (!wallet) return (
        <ConnectWallet text='Connect your wallet to edit this collection' />
    )
    return (<>
        <PreloadModal preloadStatus={preloadStatus} getStatusMessage={getStatusMessage} />
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <div className='d-flex align-items-center'>
                        <button className='clearBtn' style={{padding: '0'}} onClick={()=>navigate(-1)} ><img alt='Back' src='/arrow-left.svg' /></button>
                        <h2 className='d-inline-block ml16'>Edit<br/>Collection</h2>
                    </div>
                    <div className={styles.navLinks}>
                        { Pages.map((p: Page)=>
                            <button type='button' onClick={()=>{setPage(p)}} disabled={page.link === p.link} key={p.link}>
                                {p.title}
                            </button>)
                        }
                    </div>
                </div>
            </Col>
            <Col
                xs={12}
                md={true} /* true fills remaining space without being wider than the header */
                className='card'
            >
                {getPage()}
            </Col>
        </div>
        { unsaved &&
            <div className={styles.saveToast}>
                <div style={{margin: '0 24px 0 8px', whiteSpace: 'nowrap'}}>You have unsaved changes</div>
                <button disabled={saving} onClick={handleCancel} className='mr8 clearBtn'>Cancel</button>
                <button disabled={saving} onClick={()=>handleSave()}>{saving ? <SmallLoader /> : 'Save'}</button>
            </div>
        }
        { popupError &&
            <div className={styles.saveToast}>
                <div style={{margin: '0 24px 0 8px', whiteSpace: 'nowrap'}}>{popupError}</div>
            </div>
        }
        { preloadReady &&
            <div className={styles.saveToast}>
                <div style={{margin: '0 24px 0 8px', whiteSpace: 'nowrap'}}>You have {preloadState.items.length} NFTs to preload</div>
                <button disabled={!!preloadStatus} onClick={()=>handlePreload()}>Preload{!!preloadStatus && <SmallLoader />}</button>
            </div>
        }
    </>);
};

type PModalProps = {
  preloadStatus: PreloadStatus | undefined
  getStatusMessage: ()=>any;
}

const PreloadModal = ({preloadStatus, getStatusMessage}: PModalProps) => {
  return (
    <ModalV2 open={!!preloadStatus} locked={true} closeButton={false} onClose={()=>{}} title={'Preloading Minter'} style={{width: '256px'}} >
      <div className='d-flex flex-column justify-content-center align-items-center' style={{textAlign: 'center', paddingTop: '16px'}}>
        {getStatusMessage()}
      </div>
    </ModalV2>
  )
}

export default EditCollectionPage;