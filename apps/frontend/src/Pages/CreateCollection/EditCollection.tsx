import {ReactElement, FC, useState, useRef, useEffect} from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useLoaderData, useLocation, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import DetailPage, { DetailState, DefaultDetailState } from "./DetailPage";
import FinishPage, { DefaultFinishState, FinishState } from "./FinishPage";
import { initStandardProject } from "../../Utils/wasm/factory_handles";
import { editCollection, importCollection } from "../../Utils/backend";
import AdminPage, { AdminState, DefaultAdminState } from "./AdminPage";
import LinksPage, { DefaultLinksState, LinkState } from "./LinksPage";
import { GetCollectionResponse } from "@architech/types";
import { toast } from "react-toastify";
import equal from "fast-deep-equal";
import RewardsPage, { DefaultRewardsState, RewardsState } from "./RewardsPage";
import { getMetadata, setRewardsMetadata } from "@architech/lib";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import ConnectWallet from "../../Components/ConnectWallet";

export type Page = 'Details' | 'Rewards' | 'Links'

export const Pages: Page[] = [
    'Details',
    'Links',
    'Rewards',
]

const EditCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const navigate = useNavigate();
    const params = useParams()
    const findPage = Pages.find(p=>p.toLowerCase() === params.page?.toLowerCase()) || Pages[0]

    
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

    const [page, setPage] = useState<Page>(findPage)

    const [unsaved, setUnsaved] = useState(false);
    const [saving, setSaving] = useState(false);

    
    const [metadata, setMetadata] = useState<ContractMetadata>()
    const [loadingMetadata, setLoadingMetadata] = useState(true)
    const [loadMetadataError, setLoadMetadataError] = useState<string>();

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

    const handleDetailChange = (data: DetailState) => {
        setDetailState(data)
    }

    const getPage = () => {
        switch(page) {
            case 'Details':
                return <DetailPage current={currentDetail} state={detailState} isEditing={true} onChange={handleDetailChange} next={()=>setPage('Links')} />
            case 'Links':
                return <LinksPage state={linkState} onChange={(newState) => setLinkState(newState)} next={()=>setPage('Rewards')} />
            case 'Rewards':
                return <RewardsPage state={rewardsState} onChange={(data) => setRewardsState(data)} contractAddress={collection.address} metadata={metadata} loadingMetadata={loadingMetadata} loadingMetadataError={loadMetadataError} />
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
                            <button type='button' onClick={()=>{setPage(p)}} disabled={page === p} key={p}>
                                {p}
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
    </>);
};

export default EditCollectionPage;