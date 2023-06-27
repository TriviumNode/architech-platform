import {ReactElement, FC, useState, useRef, useEffect} from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
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
import { setRewardsMetadata } from "@architech/lib";
import SmallLoader from "../../Components/SmallLoader";

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

    const [page, setPage] = useState<Page>(Pages[0])

    const [unsaved, setUnsaved] = useState(false);
    const [saving, setSaving] = useState(false);
      
    useEffect(()=>{
        if ((!equal(currentDetail, detailState) || !equal(currentLinks, linkState)) || rewardsState.address){
            setUnsaved(true);
        }
        else setUnsaved(false)
    },[detailState, linkState, rewardsState])

    const handleDetailChange = (data: DetailState) => {
        setDetailState(data)
    }

    const getPage = () => {
        switch(page) {
            case 'Details':
                return <DetailPage state={detailState} isEditing={true} onChange={handleDetailChange} next={()=>setPage('Links')} />
            case 'Links':
                return <LinksPage state={linkState} onChange={(newState) => setLinkState(newState)} next={()=>setPage('Rewards')} />
            case 'Rewards':
                return <RewardsPage state={rewardsState} onChange={(data) => setRewardsState(data)} contractAddress={collection.address} />
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
                const response = await editCollection(collection._id, importData);
                revalidator.revalidate();
                toast.success('Saved collection profile')
            } else if (rewardsState.address) {
                const result = await setRewardsMetadata({
                    client: wallet.client,
                    signer: wallet.address,
                    contract: fullCollection.collection.address,
                    rewards_address: rewardsState.address,
                })
                setUnsaved(false)
                toast.success('Saved rewards address')
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
        <Row>
            Your wallet must be connected and authenticated to edit a collection.
        </Row>
    )
    return (<>
        <div className='d-flex gap8 tallFill'>
            <Col xs={12} md={4} className='card'>
                <div style={{margin: '48px'}} className='d-flex flex-column gap8'>
                    <div className='mb24 d-flex align-items-center'>
                        <button className='clearBtn' style={{padding: '0'}} onClick={()=>navigate(-1)} ><img alt='Back' src='/arrow-left.svg' /></button>
                        <h2 className='d-inline-block ml16'>Edit<br/>Collection</h2>
                    </div>
                    { Pages.map((p: Page)=>
                        <button type='button' onClick={()=>{setPage(p)}} disabled={page === p} className={styles.pageButton} key={p}>
                            {p}
                        </button>)
                    }
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
        {/* <Modal open={!!status} locked={true} onClose={()=>{}} >
            <Row className="px-4 pt-4">
                <Col style={{textAlign: 'center'}}>
                    { status === "CREATING" && <><p>Deploying collection...</p><Loader /></>}
                    { status === "IMPORTING" && <><p>Importing collection into Aerchitech...</p><Loader /></>}
                    { status === "COMPLETE" && <p>{detailState.name} has been created. <Link to={`/nfts/${collectionAddress}`}>View your collection.</Link></p>}
                    { status === "ERROR" && <>
                        <h3>Error</h3>
                        { !!collectionAddress &&
                        <p>
                            Your collection was deployed on chain successfully, but we were unable to import it into Architech due to the error below.<br />
                            You can try again now, or come back later and import it manually on our <Link to='nfts/import'>import page</Link>.<br />
                            Please write down your collection address:<br />
                            {collectionAddress}
                        </p>
}
                        <p>{error || 'Unknown error.'}</p>
                        
                        <button type="button" onClick={()=>setStatus(undefined)}>Close</button>
                        <button type="button" onClick={()=>handleCreate(undefined)}>Retry</button>
                    </>
                    }
              </Col>
            </Row>
        </Modal> */}
    </>);
};

export default EditCollectionPage;