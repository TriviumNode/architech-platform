import {ReactElement, FC, useState, useEffect} from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import DetailPage, { DetailState, DefaultDetailState } from "./DetailPage";
import FinishPage, { DefaultFinishState, FinishState } from "./FinishPage";
import { initStandardProject } from "../../Utils/wasm/factory_handles";
import { getTokenCount, importCollection } from "../../Utils/backend";
import LinksPage, { DefaultLinksState, LinkState } from "./LinksPage";
import ConnectWallet from "../../Components/ConnectWallet";
import CollectionAddressPage from "./CollectionAddressPage";
import { getContractInfo } from "@architech/lib";
import { QueryClient } from "../../Utils/queryClient";
import { Collection } from "@architech/types";

export type Page = 'Details' | 'Finish' | 'Links' | 'Collection'

export const Pages: Page[] = [
    'Collection',
    'Details',
    'Links',
    'Finish',
]

type Status = 'IMPORTING' | 'IMPORTING_TOKENS' | 'COMPLETE' | 'ERROR';
const ImportCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const [detailState, setDetailState] = useState<DetailState>(DefaultDetailState);
    const [linkState, setLinkState] = useState<LinkState>(DefaultLinksState);
    const [finishState, setFinishState] = useState<FinishState>(DefaultFinishState);

    
    const [status, setStatus] = useState<Status>()
    const [collectionAddress, setCollectionAddress] = useState<string>('')

    const [error, setError] = useState<string>()

    const [page, setPage] = useState<Page>(Pages[0])

    const [collection, setCollection] = useState<Collection>()
    const [count, setCount] = useState(0);

    const getPage = () => {
        switch(page) {
            case 'Collection':
                return <CollectionAddressPage handleLookup={handleLookup} state={{address: collectionAddress}} onChange={({address}) => setCollectionAddress(address)} next={()=>setPage('Details')} />
            case 'Details':
                return <DetailPage current={detailState} isImporting={true} state={detailState} onChange={(data) => setDetailState(data)} next={()=>setPage('Links')} />
            case 'Links':
                return <LinksPage state={linkState} onChange={(newState) => setLinkState(newState)} next={()=>setPage('Finish')} />
            case 'Finish':
                return <FinishPage data={finishState} onChange={(data) => setFinishState(data)} onClick={handleImport}/>
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleLookup = async() => {
        const nftInfo = await getContractInfo({ client: QueryClient, contract: collectionAddress });
        setDetailState({...detailState, name: nftInfo.name, symbol: nftInfo.symbol })
    }

    const handleImport = async (e: any) => {
        if (e) e.preventDefault();
        try {
            if (!wallet) throw new Error('Wallet is not connected.')

            setStatus("IMPORTING")
            const importData: ImportCollectionData = {
                ...detailState,
                ...finishState,
                ...linkState,
            }
            const response = await importCollection(collectionAddress, importData);
            setCollection(response);

            setStatus("IMPORTING_TOKENS")

            if (!refreshProfile) throw new Error('refreshProfile is undefined, somehow...');
            await refreshProfile()
        } catch(err: any) {
            console.error(err)
            setStatus("ERROR")
            setError(err.response.data || err.toString());
        } finally {
        }
    }

    const refreshImport = async () => {
        if (!collection) throw new Error('Unable to refresh collection import. No import is in progress.')
        const count = await getTokenCount(collection.address)
        console.log('token count')
        setCount(count);
        if (count === collection.totalTokens){
            setStatus('COMPLETE');
        }
    }

    useEffect(() => {
        if (status !== 'IMPORTING_TOKENS') return;
        const interval = setInterval(() => {
            // Runs every 5 seconds
            refreshImport();
        }, 5000);
        return () => clearInterval(interval);
    }, [status]);

    if (!wallet) return (
        <ConnectWallet text='Connect your wallet to import a collection' />
    )
    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <h2>Import<br/>Collection</h2>
                    <div className={styles.navLinks}>
                        { Pages.map((p: Page)=>
                            <button
                                type='button'
                                key={p}
                                disabled={page === p}
                                className={page==='Collection' ? styles.unclickableBtn : undefined}
                                onClick={page==='Collection' ? undefined : ()=>{setPage(p)}}
                            >
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
        <Modal open={!!status} locked={true} onClose={()=>{}} >
            <Row className="px-4 pt-4">
                <Col style={{textAlign: 'center'}}>
                    { status === "IMPORTING" && <><p>Importing collection into Architech...</p><Loader /></>}
                    { status === "IMPORTING_TOKENS" && 
                        <>
                            <h3 style={{fontFamily: 'TWK Everett'}}>Importing collection {detailState.name}</h3>
                            <h6 style={{fontFamily: 'TWK Everett'}}>This may take several minutes.</h6>
                            <p>{count} / {collection?.totalTokens} imported.</p>
                            <Loader />
                        </>
                    }
                    { status === "COMPLETE" && 
                    <>
                        <p>{detailState.name} has been imported into Architech.<br />Here's some things to do next:</p>
                        <div className='mb8'><Link className={styles.modalLink} to={`/nfts/${collectionAddress}`}>View your collection</Link></div>

                        <div className='mb16'><Link className={styles.modalLink} to={`/nfts/edit/${collectionAddress}/rewards`}>Setup Archway Rewards</Link></div>
                    </>}
                    { status === "ERROR" && <>
                        <h3>Error</h3>
                        <p>{error || 'Unknown error.'}</p>
                        
                        <button className='mr8' type="button" onClick={()=>setStatus(undefined)}>Close</button>
                        <button type="button" onClick={()=>handleImport(undefined)}>Retry</button>
                    </>
                    }
              </Col>
            </Row>
        </Modal>
    </>);
};

export default ImportCollectionPage;