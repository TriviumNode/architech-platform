import {ReactElement, FC, useState} from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import Loader from "../../Components/Loader";
import Modal from "../../Components/Modal";
import { ImportCollectionData } from "../../Interfaces/interfaces";

import styles from './create.module.scss'
import CollectionDetailPage, { DetailState, DefaultDetailState } from "./CollectionSubPages/CollectionDetailPage";
import FinishPage, { DefaultFinishState, FinishState } from "./CollectionSubPages/FinishPage";
import { initCopyProject, initRandomProject, initStandardProject } from "../../Utils/wasm/factory_handles";
import { importCollection, uploadImage } from "../../Utils/backend";
import LinksPage, { DefaultLinksState, LinkState } from "./CollectionSubPages/LinksPage";
import ConnectWallet from "../../Components/ConnectWallet";
import FinancialPage, { DefaultFinancialState, FinancialState } from "./CommonSubPages/FinancialsPage";
import NftDetailPage, { DefaultNftDetailState, NftDetailState } from "./NftSubPages/NftDetailPage";
import TimesPage, { DefaultTimesState, TimesState } from "./CollectionSubPages/TimesPage";
import WhitelistPage, { DefaultWhitelistState, WhitelistState } from "./CollectionSubPages/WhitelistPage";
import { NFT_FACTORY_ADDRESS } from "../../Utils/queryClient";
import { humanToDenom, randomString } from "@architech/lib";
import secureRandom from "secure-random";
import ImagePage from "./NftSubPages/NftImagePage";
import { cw721 } from "@architech/types";
import { toast } from "react-toastify";
import {Buffer} from 'buffer';

export type StdPage = 'Details' | 'Links' | 'Finish'
export type RandomPage = 'Details' | 'Links' | 'Financials' | 'Launch Time' | 'Whitelist' | 'Finish'
export type CopyPage = 'Collection Details' | 'Links' | 'Financials' | 'NFT Details' | 'NFT Image' | 'Times & Limits' | 'Finish'
export type Page = StdPage | RandomPage | CopyPage

export const StdPages: StdPage[] = [
    'Details',
    'Links',
    'Finish',
]

export const RandomPages: RandomPage[] = [
    'Details',
    'Links',
    'Financials',
    'Launch Time',
    'Whitelist',
    'Finish',
]

export const CopyPages: CopyPage[] = [
    'Collection Details',
    'Links',
    'Financials',
    'NFT Details',
    'NFT Image',
    'Times & Limits',
    'Finish',
]

export type CollectionType = 'STANDARD' | 'RANDOM' | 'COPY'
type Status = 'CREATING' | 'IMPORTING' | 'COMPLETE' | 'ERROR';
const CreateCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const [collectionType, setCollectionType] = useState<CollectionType>()
    const [pages, setPages] = useState<Page[]>(StdPages)
    const [page, setPage] = useState<Page>(StdPages[0])

    // State used by all collection types
    const [detailState, setDetailState] = useState<DetailState>(DefaultDetailState);
    const [linkState, setLinkState] = useState<LinkState>(DefaultLinksState);
    const [finishState, setFinishState] = useState<FinishState>(DefaultFinishState);

    // State used by Random minter
    const [financialState, setFinancialState] = useState<FinancialState>({
        ...DefaultFinancialState,
        beneficiary_address: wallet?.address || '',
    });
    const [whitelistState, setWhitelistState] = useState<WhitelistState>(DefaultWhitelistState);

    // State used by copy minter
    const [nftDetailState, setNftDetailState] = useState<NftDetailState>(DefaultNftDetailState);
    const [nftImage, setNftImage] = useState<File>();
    const [preview, setPreview] = useState<any>();

    // Used by both minters
    const [timesState, setTimesState] = useState<TimesState>(DefaultTimesState);

    // Deployment Status
    const [status, setStatus] = useState<Status>()

    // Deployed Minter Address (if using a minter)
    const [minterAddress, setMinterAddress] = useState<string>()
    // Deployed 721 Address
    const [collectionAddress, setCollectionAddress] = useState<string>()

    const [error, setError] = useState<string>()

    const selectType = (type: CollectionType) => {
        setCollectionType(type);
        const newPages = 
            type==='STANDARD' ? StdPages :
            type==='COPY' ? CopyPages :
            type==='RANDOM' ? RandomPages :
            StdPages //whatever
        setPages(newPages)
        setPage(newPages[0])
    }


    const getPage = () => {
        switch(page) {
            case 'Details':
                return <CollectionDetailPage
                    current={detailState}
                    isEditing={false}
                    state={detailState}
                    onChange={(data) => setDetailState(data)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Details')+1])}
                />
            case 'Collection Details':
                return <CollectionDetailPage
                    current={detailState}
                    isEditing={false}
                    state={detailState}
                    onChange={(data) => setDetailState(data)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Collection Details')+1])}
                />
            case 'Financials':
                return <FinancialPage
                    isCollection={true}
                    state={financialState}
                    onChange={(newState)=>setFinancialState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Financials')+1])}
                />
            case 'NFT Details':
                return <NftDetailPage
                    isCollection={true}
                    state={nftDetailState}
                    onChange={(newState)=>setNftDetailState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='NFT Details')+1])}
                />
            case 'NFT Image':
                return <ImagePage
                    image={nftImage}
                    preview={preview}
                    onChange={(data, preview) => {setNftImage(data); setPreview(preview)}}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='NFT Image')+1])}
                />
            case 'Links':
                return <LinksPage
                    state={linkState}
                    onChange={(newState) => setLinkState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Links')+1])}
                />
            case 'Launch Time':
                return <TimesPage
                    state={timesState}
                    collectionType={collectionType as CollectionType}
                    onChange={(newState)=>setTimesState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Launch Time')+1])}
                />
            case 'Times & Limits':
                return <TimesPage
                    state={timesState}
                    collectionType={collectionType as CollectionType}
                    onChange={(newState)=>setTimesState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Times & Limits')+1])}
                />
            case 'Whitelist':
                return <WhitelistPage
                    state={whitelistState}
                    onChange={(newState)=>setWhitelistState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Whitelist')+1])}
                />
            case 'Finish':
                return <FinishPage finishType='Deploy' collectionType={collectionType as CollectionType} details={detailState} financials={financialState} data={finishState} onChange={(data) => setFinishState(data)} onClick={handleCreate}/>
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const handleCreate = async (e: any) => {
        if (e) e.preventDefault();
        try {
            if (!wallet) throw new Error('Wallet is not connected.')
            let newNftAddr = collectionAddress;
            if (!collectionAddress){
                setStatus("CREATING")

                if (collectionType === "STANDARD") {
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
                    newNftAddr = contractAddress;
                } else if (collectionType === 'RANDOM') {
                    const {minterAddress, nftAddress} = await initRandomProject({
                        client: wallet.client, signer: wallet.address,
                        contract: NFT_FACTORY_ADDRESS,
                        nft_admin: wallet.address,
                        minter_admin: wallet.address,
                        beneficiary: financialState.beneficiary_address,
                        nft_name: detailState.name,
                        nft_symbol: detailState.symbol,
                        minter_label: `${detailState.name}_Random_Minter_${randomString(6)}`,
                        launch_time: timesState.launch_time ? timesState.launch_time.valueOf().toString() + '000000' : undefined,
                        whitelist_launch_time: timesState.whitelist_launch_time ? timesState.whitelist_launch_time.valueOf().toString() + '000000' : undefined,
                        mint_price: financialState.denom.nativeDenom ? 
                            {
                                native_payment: {
                                    amount: humanToDenom(financialState.amount, financialState.denom.decimals),
                                    denom: financialState.denom.nativeDenom,
                                }
                            }
                            : financialState.denom.cw20Contract ?
                            {
                                cw20_payment: {
                                    amount: humanToDenom(financialState.amount, financialState.denom.decimals),
                                    token: financialState.denom.cw20Contract
                                }
                            }
                            :
                            {
                                cw20_payment: {
                                    amount: 'error',
                                    token: (()=>{throw new Error('Invalid Denom')}) as unknown as string, // fuck off
                                }
                            }
                        ,
                        whitelisted: [],
                    })
                    console.log('Init Result', {minterAddress, nftAddress})
                    setCollectionAddress(nftAddress)
                    newNftAddr = nftAddress;
                } else if (collectionType === 'COPY') {

                    // Clean NFT Attributes
                    const badAttributes = nftDetailState.attributes.filter((attribute: cw721.Trait)=>
                        (!attribute.trait_type && attribute.value) || (attribute.trait_type && !attribute.value)
                    )
                    const filteredAttributes = nftDetailState.attributes.filter((attribute: cw721.Trait)=> (attribute.trait_type && attribute.trait_type !== '') && (attribute.value && attribute.value !== ''))

                    // CLean NFT Details
                    const cleanedDetails = { ...nftDetailState, nftImage, attributes: filteredAttributes };

                    // Remove unfilled attributes
                    Object.keys(cleanedDetails).forEach((key: any) => 
                        //@ts-expect-error
                        (cleanedDetails[key]?.trait_type === '' && cleanedDetails[key]?.value === '') && delete cleanedDetails[key]);


                    //verify required data
                    console.log('cleanedDetails', cleanedDetails)
                    let err = false;
                    if (!cleanedDetails.name) {toast.error('Please enter a name for the NFT.'); err=true;}
                    if (!cleanedDetails.nftImage) {toast.error('Please upload an image for the NFT.'); err=true;}
                    if (badAttributes.length) {toast.error('Please complete Type and Value for all Attributes.'); err=true;}
                    if (!detailState.name) {toast.error('Please enter a name for the Collection.'); err=true;}
                    if (!detailState.symbol) {toast.error('Please enter a symbol for the Collection.'); err=true;}
                    setStatus(undefined);
                    if (err) return;
                    
                    //@ts-expect-error
                    const cid = await uploadImage(cleanedDetails.nftImage);

                    const {minterAddress, nftAddress} = await initCopyProject({
                        client: wallet.client, signer: wallet.address,
                        contract: NFT_FACTORY_ADDRESS,

                        nft_admin: wallet.address,
                        minter_admin: wallet.address,
                        beneficiary: financialState.beneficiary_address,

                        end_time: timesState.end_time ? timesState.end_time.getSeconds().toString() : undefined,
                        launch_time: timesState.launch_time ? timesState.launch_time.getSeconds().toString() : undefined,
                        mint_limit: timesState.mint_limit ? parseInt(timesState.mint_limit) : undefined,

                        nft_name: detailState.name,
                        nft_symbol: detailState.symbol,
                        minter_label: `${detailState.name}_Copy_Minter_${randomString(6)}`,
                        nft_label: `Architech_Copy_Collection_${detailState.name.trim()}_${Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64")}}`,
                        metadata: {
                            name: cleanedDetails.name,
                            description: cleanedDetails.description,
                            attributes: cleanedDetails.attributes,
                            external_url: cleanedDetails.externalLink,
                            royalty_payment_address: financialState.royalty_address,
                            royalty_percentage: financialState.royalty_percent ? parseInt(financialState.royalty_percent) : undefined,
                            image: `ipfs://${cid}`,
                        },
                        mint_price: financialState.amount ?
                            financialState.denom.cw20Contract ?
                                { cw20_payment: {
                                    amount: financialState.amount,
                                    token: financialState.denom.cw20Contract,
                                }}
                            : financialState.denom.nativeDenom ?
                                { native_payment: {
                                    amount: financialState.amount,
                                    denom: financialState.denom.nativeDenom,
                                }}
                                : undefined
                            : undefined,
                    });
                    console.log('Init Result', {minterAddress, nftAddress})
                    setCollectionAddress(nftAddress)
                    newNftAddr = nftAddress;
                } else {
                    throw new Error(`Unknown collection type ${collectionType}`)
                }
            }
            console.log('NFT Address', newNftAddr)
            
            setStatus("IMPORTING")
            const importData: ImportCollectionData = {
                ...detailState,
                ...finishState,
                ...linkState,
            }
            const response = await importCollection(newNftAddr as string, importData);
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
    if (!collectionType) return (
        <div className={styles.mainRow}>
            <div className={styles.selectTypeCard}>
            <div className={styles.inner}>
                <div>
                    <h1>New Collection Type</h1>
                </div>
                <div className={styles.buttonRow}>
                <Col xs='auto'>
                    <button type='button' onClick={()=>selectType('STANDARD')} >
                        <h3>Standard<br/>Collection</h3>
                        <p className='lightText12'>
                            Create NFTs one at a time. Create more in the same collection any time. 
                            Great for small collections and one-off art.
                        </p>
                    </button>
                </Col>
                <Col xs='auto'>
                    <button type='button' onClick={()=>selectType('RANDOM')} >
                        <h3>Random<br/>Collection</h3>
                        <p className='lightText12'>
                            Preload NFTs in bulk, then distribute them one at a time randomly. 
                            Great for PFP collectons.
                        </p>
                    </button>
                </Col>
                <Col xs='auto'>
                    <button type='button' onClick={()=>selectType('COPY')} >
                        <h3>Copy<br/>Collection</h3>
                        <p className='lightText12'>
                            Sell or give away copies of an NFT. Optionally limit by number of copies or time. 
                            Great for tickets and limited edition art.
                        </p>
                    </button>
                </Col>
                </div>
            </div>
            </div>
        </div>
    )
    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <h2>New {collectionType}<br/>Collection</h2>
                    <div className={styles.navLinks}>
                        { pages.map((p: Page)=>
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
                        { collectionType === 'RANDOM' ?
                        <div className='mb16'><Link className={styles.modalLink} to={`/nfts/edit/${collectionAddress}/preload`}>Load Items into the Random Minter</Link></div>
                    :
                    <>
                    <div className='mb8'><Link className={styles.modalLink} to={`/nfts/${collectionAddress}`}>View your collection</Link></div>

                    <div className='mb16'><Link className={styles.modalLink} to={`/nfts/edit/${collectionAddress}/rewards`}>Setup Archway Rewards</Link></div>
                    </>}
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
                        
                        <button className='mr8' type="button" onClick={()=>setStatus(undefined)}>Close</button>
                        <button type="button" onClick={()=>handleCreate(undefined)}>Retry</button>
                    </>
                    }
              </Col>
            </Row>
        </Modal>
    </>);
};

export default CreateCollectionPage;