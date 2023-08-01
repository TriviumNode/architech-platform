import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import CollectionDetailPage, { DetailState } from "./CollectionSubPages/CollectionDetailPage";
import { editCollection, uploadBatch } from "../../Utils/backend";
import LinksPage, { LinkState } from "./CollectionSubPages/LinksPage";
import { cw2981, GetCollectionResponse } from "@architech/types";
import { toast } from "react-toastify";
import equal from "fast-deep-equal";
import RewardsPage, { DefaultRewardsState, RewardsState } from "./CollectionSubPages/RewardsPage";
import { getMetadata, preloadData, setRewardsMetadata } from "@architech/lib";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import ConnectWallet from "../../Components/ConnectWallet";
import MinterPreloadPage, { DefaultPreloadState, PreloadState } from "./CollectionSubPages/MinterPreloadPage";

import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {Buffer} from 'buffer';



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

export const RandomPAGES: Page[] = [
    ...PAGES,
    {
        link: 'preload',
        title: 'Preload Minter',
    },
]

const EditCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const navigate = useNavigate();
    const params = useParams()

    const [Pages, setPages] = useState<Page[]>(fullCollection.collection.collectionMinter?.minter_type === 'RANDOM' ? RandomPAGES : PAGES);

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

    const [detailState, setDetailState] = useState<DetailState>(currentDetail);
    const [linkState, setLinkState] = useState<LinkState>(currentLinks);
    const [rewardsState, setRewardsState] = useState<RewardsState>(DefaultRewardsState);
    const [preloadState, setPreloadState] = useState<PreloadState>(DefaultPreloadState);

    const [page, setPage] = useState<Page>(findPage)

    const [unsaved, setUnsaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preloading, setPreloading] = useState(false);
    const [preloadReady, setPreloadReady] = useState(false);

    
    const [metadata, setMetadata] = useState<ContractMetadata>()
    const [loadingMetadata, setLoadingMetadata] = useState(true)
    const [loadMetadataError, setLoadMetadataError] = useState<string>();

    const [popupError, setPopupError] = useState<any>();

    const changePage = (newLink: string) => {
        setPage(Pages.find(p=>p.link===newLink) as Page);
    }

    useEffect(()=>{
        refreshMetadata();
    },[QueryClient])

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
      
    useEffect(()=>{
        if ((!equal(currentDetail, detailState) || !equal(currentLinks, linkState)) || rewardsState.address){
            setUnsaved(true);
        }
        else {
            setUnsaved(false)
        }
    },[detailState, linkState, rewardsState])

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
                return <MinterPreloadPage state={preloadState} onChange={(data) => setPreloadState(data)}  />
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
    }

    const handlePreload = async() => {
        if (!wallet) throw new Error('Wallet is not connected.');
        if (!fullCollection.collection.collectionMinter) throw new Error(`This collection doesn't have a Minter.`);
        setPreloading(true);
        try {
            const uploadResult = await uploadBatch(preloadState.images.map(i=>i.file));
            console.log(uploadResult);

            const cleanMetadata: cw2981.Metadata[] = preloadState.items.map(i=>{
                if (!i.image) {
                    const findImg = uploadResult.find((r: any)=>r.fileName === i.file_name);
                    if (!findImg) throw new Error(`Unable to find filename ${i.file_name} in upload result.`)
                    console.log('uncleaned', i)
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
            console.log('cleanMetadata', cleanMetadata)

            // Simulate Gas limit. This breaks if I do it in the lib package for some reason.
            const msg = {
                preload_data: {
                    new_data: cleanMetadata
                }
            }
        
            const WasmMsg = {
                typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: MsgExecuteContract.fromPartial({
                  contract: fullCollection.collection.collectionMinter?.minter_address as string,
                  msg: Buffer.from(JSON.stringify(msg)),
                  sender: wallet.address
                }),
            };

            const result = await preloadData({
                client: wallet.client,
                signer: wallet.address,
                contract: fullCollection.collection.collectionMinter?.minter_address as string,
                metadata: cleanMetadata,
            })
            console.log(result);
            setPreloadState(DefaultPreloadState);
            toast.success(`Preloaded ${cleanMetadata.length} NFTs`)
        } catch(err: any) {
            toast.error(err.toString());
            console.error(err);
        }
        setPreloading(false)
    }

    if (!wallet) return (
        <ConnectWallet text='Connect your wallet to edit this collection' />
    )
    return (<>
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
                <button disabled={preloading} onClick={()=>handlePreload()}>Preload{preloading && <SmallLoader />}</button>
            </div>
        }
    </>);
};

export default EditCollectionPage;