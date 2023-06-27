import {ReactElement, FC, useState} from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import DetailPage, { DetailState, DefaultDetailState } from "./NftDetailPage";
import { initStandardProject } from "../../Utils/wasm/factory_handles";
import { importCollection, refreshCollection, uploadImage } from "../../Utils/backend";
import ImagePage from "./NftImagePage";
import ReviewNftPage from "./ReviewPage";
import { mintNft } from '@architech/lib';
import CollectionPage from "./CollectionPage";
import { Collection, cw721, GetCollectionResponse } from "@architech/types";
import FinancialPage, { DefaultFinancialState, FinancialState } from "./FinancialsPage";
import sleep from "../../Utils/sleep";

export type Page = 'Collection' | 'Details' | 'Image' | 'Review' | 'Financials'

export const Pages: Page[] = [
    'Collection',
    'Details',
    'Image',
    'Financials',
    'Review',
]

type Status = 'UPLOADING' | 'MINTING' | 'IMPORTING' | 'COMPLETE' | 'ERROR';
const CreateSingleNftPage: FC<any> = (): ReactElement => {
    const { collection: fullCollection } = useLoaderData() as { collection?: GetCollectionResponse};
    const { user: wallet } = useUser();
    const [detailState, setDetailState] = useState<DetailState>(DefaultDetailState);
    const [financialState, setFinancialState] = useState<FinancialState>({
        address: wallet?.address || '',
        percent: '',
    });
    const [image, setImage] = useState<File>();
    const [preview, setPreview] = useState<any>();

    const [collection, setCollection] = useState<Collection | undefined>(fullCollection?.collection)
    
    const [status, setStatus] = useState<Status>()
    const [error, setError] = useState<any>()

    const [page, setPage] = useState<Page>(Pages[0])


    const getPage = () => {
        switch(page) {
            case 'Collection':
                return <CollectionPage collection={collection} onChange={(data) => setCollection(data)} next={()=>setPage('Details')} />
            case 'Details':
                return <DetailPage state={detailState} onChange={(data) => setDetailState(data)} next={()=>setPage('Image')} />
            case 'Image':
                return <ImagePage image={image} preview={preview} onChange={(data, preview) => {setImage(data); setPreview(preview)}} next={()=>setPage('Financials')} />
            case 'Financials':
                return <FinancialPage state={financialState} onChange={(data) => setFinancialState(data)} next={()=>setPage('Review')} />
            case 'Review':
                return <ReviewNftPage onClick={handleCreate} />
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleCreate = async (e: any) => {
        if (e) e.preventDefault();

        const badAttributes = detailState.attributes.filter((attribute: cw721.Trait)=>
            (!attribute.trait_type && attribute.value) || (attribute.trait_type && !attribute.value)
        )

        const filteredAttributes = detailState.attributes.filter((attribute: cw721.Trait)=> attribute.trait_type && attribute.value)

        const cleanedDetails = { ...detailState, image, attributes: filteredAttributes };

        // Remove unfilled attributes
        Object.keys(cleanedDetails).forEach((key: any) => 
            //@ts-expect-error
            (cleanedDetails[key]?.trait_type === '' && cleanedDetails[key]?.value === '') && delete cleanedDetails[key]);

        //verify required data
        if (!cleanedDetails.name || !cleanedDetails.tokenId || !cleanedDetails.image || badAttributes.length) {
            setStatus("ERROR")
            setError(<div>
                { (!cleanedDetails.name || !cleanedDetails.tokenId || badAttributes.length) && <p className='mb24'>
                    Please fill the following fields:<br />
                    <ul style={{textAlign: 'left', margin: '8px 0'}}>
                        {!cleanedDetails.name && <li>Name<br /></li>}
                        {!cleanedDetails.name && <li>Token ID<br /></li>}
                        {!!badAttributes.length && <li>Attributes<br /></li>}
                    </ul>
                    <button type='button' className='buttonLink' onClick={()=>{
                        setStatus(undefined);
                        setError(undefined);
                        setPage('Details');
                    }}>Click here to visit the details page</button>
                    </p>}
                {(!cleanedDetails.image) &&
                    <p className='mb24'>
                        Please select an image for this NFT.<br />
                        <button type='button' className='buttonLink' onClick={()=>{
                            setStatus(undefined);
                            setError(undefined);
                            setPage('Image');
                        }}>
                            Click here to visit the image page
                        </button>
                    </p>
                }
            </div>);
            return;
        }

        try {
            if (!wallet) throw new Error('Wallet is not connected.')
            if (!image) throw new Error('No image selected.')
            
            if (!collection) throw new Error('No collection selected.')

            setStatus("UPLOADING")
            const cid = await uploadImage(image);

            setStatus("MINTING")
            const result = await mintNft({
                client: wallet.client,
                signer: wallet.address,
                contract: collection.address,
                tokenId: cleanedDetails.tokenId,
                extension: {
                    name: cleanedDetails.name,
                    description: cleanedDetails.description || undefined,
                    image: `ipfs://${cid}`,
                    attributes: cleanedDetails.attributes.length ? detailState.attributes : undefined,
                    external_url: cleanedDetails.externalLink || undefined,
                    royalty_payment_address: financialState.address || undefined,
                    royalty_percentage: financialState.percent ? parseInt(financialState.percent) : undefined,
                },
                owner: wallet.address,
            })
            
            setStatus("IMPORTING")
            const updateResponse = await refreshCollection(collection.address);
            await sleep(1_000);

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
            Your wallet must be connected and authenticated to create an NFT.
        </Row>
    )
    return (<>
        <div className='d-flex gap8 tallFill'>
            <Col xs={12} md={4} className='card'>
                <div style={{margin: '48px'}} className='d-flex flex-column gap8'>
                    <h2 className='mb24'>Create<br/>NFT</h2>
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
        <Modal open={!!status} locked={true} onClose={()=>{}} style={{width: error ? '50vw' : undefined}} >
            <Row className="px-4 pt-4 justify-content-center">
                <Col xs='auto' style={{textAlign: 'center'}}>
                    { status === "UPLOADING" && <><p>Uploading image to IPFS...</p><Loader /></>}
                    { status === "MINTING" && <><p>Minting NFT on chain...<br />Please approve the transaction in your wallet.</p><Loader /></>}
                    { status === "IMPORTING" && <><p>Importing collection into Aerchitech...</p><Loader /></>}
                    { status === "COMPLETE" && <p>{detailState.name} has been created. <Link to={`/nfts/${collection?.address}/${detailState.tokenId}`}>View your NFT.</Link></p>}
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
    </>);
};

export default CreateSingleNftPage;