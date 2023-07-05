import {ReactElement, FC, useState} from "react";
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
import { importCollection } from "../../Utils/backend";
import LinksPage, { DefaultLinksState, LinkState } from "./LinksPage";
import ConnectWallet from "../../Components/ConnectWallet";

export type Page = 'Details' | 'Finish' | 'Links'

export const Pages: Page[] = [
    'Details',
    'Links',
    'Finish',
]

type Status = 'CREATING' | 'IMPORTING' | 'COMPLETE' | 'ERROR';
const CreateCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const [detailState, setDetailState] = useState<DetailState>(DefaultDetailState);
    const [linkState, setLinkState] = useState<LinkState>(DefaultLinksState);
    const [finishState, setFinishState] = useState<FinishState>(DefaultFinishState);

    
    const [status, setStatus] = useState<Status>()
    const [collectionAddress, setCollectionAddress] = useState<string>()
    const [error, setError] = useState<string>()

    const [collectionType, setCollectionType] = useState<string>('STANDARD')

    const [page, setPage] = useState<Page>(Pages[0])

    const getPage = () => {
        switch(page) {
            case 'Details':
                return <DetailPage current={detailState} isEditing={false} state={detailState} onChange={(data) => setDetailState(data)} next={()=>setPage('Links')} />
            case 'Links':
                return <LinksPage state={linkState} onChange={(newState) => setLinkState(newState)} next={()=>setPage('Finish')} />
            case 'Finish':
                return <FinishPage data={finishState} onChange={(data) => setFinishState(data)} onClick={handleCreate}/>
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleCreate = async (e: any) => {
        if (e) e.preventDefault();
        try {
            if (!wallet) throw new Error('Wallet is not connected.')
            let nftAddress = collectionAddress;
            if (!collectionAddress){
                setStatus("CREATING")
                const result = await initStandardProject({
                    client: wallet.client,
                    signer: wallet.address,
                    contract_name: detailState.name,
                    nft_symbol: detailState.symbol,
                    minter: wallet.address,
                })
                console.log('Init Result', result);
                const { contractAddress } = result;
                setCollectionAddress(contractAddress)
                nftAddress = contractAddress;
            }
            console.log('NFT Address', nftAddress)
            
            setStatus("IMPORTING")
            const importData: ImportCollectionData = {
                ...detailState,
                ...finishState,
                ...linkState,
            }
            const response = await importCollection(nftAddress as string, importData);
            if (!refreshProfile) throw 'WOT'
            await refreshProfile()
            console.log('Import Response', response)
            setStatus("COMPLETE")
        } catch(err: any) {
            console.error(err)
            setStatus("ERROR")
            setError(err.toString());
        } finally {
        }
    }

    if (!wallet) return (
        <ConnectWallet text='Connect your wallet to create a collection' />
    )
    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <h2>New<br/>Collection</h2>
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
        <Modal open={!!status} locked={true} onClose={()=>{}} >
            <Row className="px-4 pt-4">
                <Col style={{textAlign: 'center'}}>
                    { status === "CREATING" && <><p>Deploying collection...</p><Loader /></>}
                    { status === "IMPORTING" && <><p>Importing collection into Architech...</p><Loader /></>}
                    { status === "COMPLETE" && 
                    <>
                        <p>{detailState.name} has been created.<br />Here's some things to do next:</p>
                        <div className='mb8'><Link className={styles.modalLink} to={`/nfts/${collectionAddress}`}>View your collection</Link></div>

                        <div className='mb16'><Link className={styles.modalLink} to={`/nfts/edit/${collectionAddress}/rewards`}>Setup Archway Rewards</Link></div>
                    </>
                    }
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
        </Modal>
    </>);
};

export default CreateCollectionPage;