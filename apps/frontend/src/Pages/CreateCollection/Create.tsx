import {ReactElement, FC, useState} from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import DetailPage, { DetailState, DefaultDetailState } from "./DetailPage";
import RoyaltyPage, { DefaultRoyaltyState, RoyaltyState } from "./RoyaltyPage";
import FinishPage, { DefaultFinishState, FinishState } from "./FinishPage";
import { initStandardProject } from "../../Utils/wasm/factory_handles";
import { importCollection } from "../../Utils/backend";

export type Page = 'Details' | 'Royalties' | 'Finish'

export const Pages: Page[] = [
    'Details',
    'Royalties',
    'Finish',
]

type Status = 'CREATING' | 'IMPORTING' | 'COMPLETE' | 'ERROR';
const CreateCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet } = useUser();
    const [detailState, setDetailState] = useState<DetailState>(DefaultDetailState);
    const [royaltyState, setRoyaltyState] = useState<RoyaltyState>(DefaultRoyaltyState);
    const [finishState, setFinishState] = useState<FinishState>(DefaultFinishState);

    
    const [status, setStatus] = useState<Status>()
    const [collectionAddress, setCollectionAddress] = useState<string>()
    const [error, setError] = useState<string>()

    const [collectionType, setCollectionType] = useState<string>('STANDARD')

    const [page, setPage] = useState<Page>(Pages[0])

    const getPage = () => {
        switch(page) {
            case 'Details':
                return <DetailPage data={detailState} onChange={(data) => setDetailState(data)} />
            case 'Royalties':
                return <RoyaltyPage data={royaltyState} onChange={(data) => setRoyaltyState(data)} />
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
                console.log(result);
                const { contractAddress } = result;
                setCollectionAddress(contractAddress)
                nftAddress = contractAddress;
            }
            console.log('NFT Address', nftAddress)
            
            setStatus("IMPORTING")
            const importData: ImportCollectionData = {
                ...detailState,
                ...finishState,
            }
            const response = await importCollection(nftAddress as string, importData);
            console.log('response', response)
            setStatus("COMPLETE")
        } catch(err: any) {
            console.error(err)
            setStatus("ERROR")
            setError(err.toString());
        } finally {
        }
    }

    if (!wallet) return (
        <Row>
            Your wallet must be connected and authenticated to create a collection.
        </Row>
    )
    return (<>
        <div className='d-flex gap8 tallFill'>
            <Col xs={12} md={4} className='card'>
                <div style={{margin: '48px'}} className='d-flex flex-column gap8'>
                    <h2 className='mb24'>New<br/>Collection</h2>
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
        <Modal open={!!status} locked={true} onClose={()=>{}} >
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
        </Modal>
        {/* <Row style={{justifyContent: "center"}}>
            <Col xs={12} md={6}>
                <form onSubmit={handleCreate}>
                    <Row>
                        <OptionSelector onChange={setCollectionType} value={collectionType} items={[
                            {
                                content: `Random Mint Collection`,
                                value: 'RANDOM',
                            },
                            {
                                content: `Standard Collection`,
                                value: 'STANDARD',
                            }
                        ]} />

                    </Row>
                    <Row>
                        <label>
                            Collection Name:<br />
                            <input  value={formState.name} onChange={(e)=> updateFormState({name: e.target.value})} />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Collection Symbol:<br />
                            <input value={formState.symbol} onChange={(e)=> updateFormState({symbol: e.target.value})}  />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Description:<br />
                            <textarea value={formState.description} onChange={(e)=> updateFormState({description: e.target.value})}  />
                        </label>
                    </Row>
                    <Row>
                        <label>
                            Create Hidden:<br />
                            <input type="checkbox" checked={formState.hidden} onChange={(e)=> updateFormState({hidden: e.target.checked})}  />
                        </label>
                    </Row>
                    <Row>
                        <Col xs="auto">
                            <label>
                                Collection Image:<br />
                                <input
                                    type="file"
                                    onChange={(e)=> {
                                        if (e.target.files) {
                                            console.log(e.target.files[0])
                                            updateFormState({profileImage: e.target.files[0]})
                                        }
                                    }}
                                    accept="image/*"
                                />
                            </label>
                        </Col>
                        <Col xs="auto">
                            <label>
                                Collection Banner:<br />
                                <input
                                    type="file"
                                    onChange={(e)=> {
                                        if (e.target.files) {
                                            console.log(e.target.files[0])
                                            updateFormState({bannerImage: e.target.files[0]})
                                        }
                                    }}
                                    accept="image/*"
                                />
                            </label>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col xs="auto">
                            <button type="submit">Create</button>
                        </Col>
                    </Row>
                </form>
            </Col>
        </Row> */}
    </>);
};

export default CreateCollectionPage;