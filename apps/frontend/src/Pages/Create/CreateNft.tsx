import {ReactElement, FC, useState} from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";

import NftDetailPage, { NftDetailState, DefaultNftDetailState } from "./NftSubPages/NftDetailPage";
import { refreshCollection, uploadImage } from "../../Utils/backend";
import ImagePage from "./NftSubPages/NftImagePage";
import ReviewNftPage from "./NftSubPages/ReviewPage";
import { humanToDenom, mintNft, parseError } from '@architech/lib';
import CollectionPage from "./NftSubPages/CollectionPage";
import { Collection, cw721, GetCollectionResponse } from "@architech/types";
import FinancialPage, { DefaultFinancialState, FinancialState } from "./CommonSubPages/FinancialsPage";
import sleep from "../../Utils/sleep";
import ConnectWallet from "../../Components/ConnectWallet";

import styles from './create.module.scss'
import { mintAndList } from "../../Utils/wasm/multi_handles";
import TasksModal, { Task } from "./TasksModal/TasksModal";

export type Page = 'Collection' | 'Details' | 'Image' | 'Review' | 'Financials'

export const Pages: Page[] = [
    'Collection',
    'Details',
    // 'Image',
    'Financials',
    'Review',
]

type Status = 'UPLOADING' | 'MINTING' | 'IMPORTING' | 'COMPLETE' | 'ERROR';
const CreateSingleNftPage: FC<any> = (): ReactElement => {
    const { collection: fullCollection } = useLoaderData() as { collection?: GetCollectionResponse};
    const { user: wallet } = useUser();
    const [detailState, setDetailState] = useState<NftDetailState>(DefaultNftDetailState);
    const [financialState, setFinancialState] = useState<FinancialState>({
        ...DefaultFinancialState,
        royalty_address: wallet?.address || '',
    });
    // const [image, setImage] = useState<File>();
    // const [preview, setPreview] = useState<any>();

    const [collection, setCollection] = useState<Collection | undefined>(fullCollection?.collection)
    
    const [status, setStatus] = useState<Status>()
    const [error, setError] = useState<any>()

    const [page, setPage] = useState<Page>(Pages[0])

    const [isMinted, setIsMinted] = useState(false);

    const [errorTasks, setErrorTasks] = useState<Task[]>([])
    const [errorTaskMessage, setErrorTaskMessage] = useState<any>()


    const getPage = () => {
        switch(page) {
            case 'Collection':
                return <CollectionPage collection={collection} onChange={(data) => setCollection(data)} next={()=>setPage('Details')} />
            case 'Details':
                return <NftDetailPage state={detailState} onChange={(data) => setDetailState(data)} next={()=>setPage(Pages[Pages.findIndex(p=>p==='Details')+1])} collection={collection as Collection} />
            // case 'Image':
            //     return <ImagePage image={image} preview={preview} onChange={(data, preview) => {setImage(data); setPreview(preview)}} next={()=>setPage('Financials')} />
            case 'Financials':
                return <FinancialPage state={financialState} onChange={(data) => setFinancialState(data)} next={()=>setPage('Review')} />
            case 'Review':
                return <ReviewNftPage details={detailState} collection={collection} onClick={handleCreate} />
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleCreate = async (e: any) => {
        if (e) e.preventDefault();

        if (!isMinted){
            const badAttributes = detailState.attributes.filter((attribute: cw721.Trait)=>
                (!attribute.trait_type && attribute.value) || (attribute.trait_type && !attribute.value)
            )
            const filteredAttributes = detailState.attributes.filter((attribute: cw721.Trait)=> (attribute.trait_type && attribute.trait_type !== '') && (attribute.value && attribute.value !== ''))
            const cleanedDetails = { ...detailState, attributes: filteredAttributes };

            // Remove unfilled attributes
            Object.keys(cleanedDetails).forEach((key: any) => 
                //@ts-expect-error
                (cleanedDetails[key]?.trait_type === '' && cleanedDetails[key]?.value === '') && delete cleanedDetails[key]);

            // ####################
            // Verify Required Data
            // ####################
            const newErrorTasks: Task[] = []
            if (!cleanedDetails.name || !cleanedDetails.tokenId){
                console.log('AAA')
                newErrorTasks.push({
                    content: `Enter a ${
                        !cleanedDetails.name ?
                            !cleanedDetails.tokenId ?
                                'Name and Token ID'
                            :
                                'Name'
                        : !cleanedDetails.tokenId ?
                            'Token ID'
                        : 'UNKNOWN'
                    } for the NFT`,
                    onClick: ()=>setPage('Details')
                })
            }
            if (!cleanedDetails.image) {
                newErrorTasks.push({
                    content: `Select an Image for the NFT`,
                    onClick: ()=>setPage('Details')
                })
            }
            if (badAttributes.length) {
                newErrorTasks.push({
                    content: `Make sure all Attributes have a Type and Value`,
                    onClick: ()=>setPage('Details')
                })
            }

            // Show modal if errors are found
            if (newErrorTasks.length){
                const newErrorContent = (
                    <h3>Required information is missing</h3>
                )
                setErrorTasks(newErrorTasks);
                setErrorTaskMessage(newErrorContent);
                setStatus("ERROR")
                return;
            }
            
            try {
                if (!wallet) throw new Error('Wallet is not connected.')
                if (!detailState.image) throw new Error('No image selected.')
                
                if (!collection) throw new Error('No collection selected.')

                setStatus("UPLOADING")
                const cid = await uploadImage(detailState.image);

                setStatus("MINTING")
                const extension = {
                    name: cleanedDetails.name,
                    description: cleanedDetails.description || undefined,
                    image: `ipfs://${cid}`,
                    attributes: cleanedDetails.attributes.length ? cleanedDetails.attributes : undefined,
                    external_url: cleanedDetails.externalLink || undefined,
                    royalty_payment_address: financialState.royalty_address || undefined,
                    royalty_percentage: financialState.royalty_percent ? parseInt(financialState.royalty_percent) : undefined,
                };
                if (financialState.list) {
                    if (financialState.denom.nativeDenom !== process.env.REACT_APP_NETWORK_DENOM)
                        throw new Error(`Only ${process.env.REACT_APP_NETWORK_DENOM} listings are currently supported.`);

                    const denomAmount = humanToDenom(financialState.amount, financialState.denom.decimals);

                    const result = await mintAndList({
                        client: wallet.client,
                        signer: wallet.address,
                        nft_address: collection.address,
                        token_id: cleanedDetails.tokenId,
                        extension,
                        owner: wallet.address,
                        amount: denomAmount,
                    });
                    console.log('Mint and List Result', result);
                } else {
                    const result = await mintNft({
                        client: wallet.client,
                        signer: wallet.address,
                        contract: collection.address,
                        tokenId: cleanedDetails.tokenId,
                        extension,
                        owner: wallet.address,
                    });
                    console.log('Mint Result', result);
                }
                setIsMinted(true);
            } catch(err: any) {
                console.error('Minting Error', err)
                setStatus("ERROR")
                setError(`Error minting: ${parseError(err)}`);
                return;
            }
        }

        try {
            if (!collection) throw new Error('No collection selected.')
            setStatus("IMPORTING")
            const updateResponse = await refreshCollection(collection.address);
            await sleep(1_000);
            setStatus("COMPLETE")
        } catch(err: any) {
            console.error(err)
            setStatus("ERROR")
            setError(`Error importing into Architech: ${parseError(err)}`);
        }
    }

    if (!wallet) return (
        <ConnectWallet text='Connect your wallet to create an NFT' />
    )
    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <h2>Create<br/>NFT</h2>
                    <div className={styles.navLinks}>
                        { Pages.map((p: Page)=>
                            <button
                                type='button'
                                key={p}
                                disabled={page === p}
                                className={
                                    page==='Collection' && !collection ? 'unclickable' :
                                    // page==='Details' && p!=='Collection' ? 'unclickable' :
                                    undefined
                                }
                                onClick={
                                    page==='Collection' && !collection ? undefined :
                                    // page==='Details' && p!=='Collection' ? undefined :
                                    ()=>{setPage(p)}}
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
        <Modal open={!!status && status !== 'ERROR'} locked={true} onClose={()=>{}} style={{width: error ? '50vw' : undefined}} >
            <Row className="px-4 pt-4 justify-content-center">
                <Col xs='auto' style={{textAlign: 'center'}}>
                    { status === "UPLOADING" && <><p>Uploading image to IPFS...</p><Loader /></>}
                    { status === "MINTING" && <><p>Minting NFT on chain...<br />Please approve the transaction in your wallet.</p><Loader /></>}
                    { status === "IMPORTING" && <><p>Importing collection into Architech...</p><Loader /></>}
                    { status === "COMPLETE" && <p>{detailState.name} has been created. <Link to={`/nfts/${collection?.address}/${encodeURIComponent(detailState.tokenId)}`}>View your NFT.</Link></p>}
                    { status === "ERROR" && <>
                        <h3>Error</h3>
                        <div>{error || 'Unknown error.'}</div>
                        
                        <button className='mr8' type="button" onClick={()=>setStatus(undefined)}>Close</button>
                        <button type="button" onClick={()=>handleCreate(undefined)}>Retry</button>
                    </>
                    }
              </Col>
            </Row>
        </Modal>
        <TasksModal open={status==='ERROR'} close={()=>setStatus(undefined)} tasks={errorTasks} content={errorTaskMessage} />
    </>);
};

export default CreateSingleNftPage;