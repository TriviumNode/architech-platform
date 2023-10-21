import {ReactElement, FC, useState, useEffect} from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
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
import { DISABLED_FEATURES, NFT_FACTORY_ADDRESS } from "../../Utils/queryClient";
import { humanToDenom, parseError, randomString } from "@architech/lib";
import secureRandom from "secure-random";
import ImagePage from "./NftSubPages/NftImagePage";
import { cw721 } from "@architech/types";
import { toast } from "react-toastify";
import {Buffer} from 'buffer';
import TasksModal, { Task } from "./TasksModal/TasksModal";

import { bech32 } from "bech32";

export type StdPage = 'Details' | 'Links' | 'Finish'
export type RandomPage = 'Details' | 'Links' | 'Financials' | 'Times & Limits' | 'Whitelist' | 'Finish'
export type CopyPage = 'Collection Details' | 'Links' | 'Financials' | 'NFT Details' | 'NFT Image' | 'Times & Limits' | 'Whitelist' | 'Finish'
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
    'Times & Limits',
    'Whitelist',
    'Finish',
]

export const CopyPages: CopyPage[] = [
    'Collection Details',
    'Links',
    'Financials',
    'NFT Details',
    'Times & Limits',
    'Whitelist',
    'Finish',
]

export type CollectionType = 'STANDARD' | 'RANDOM' | 'COPY'
type Status = 'CREATING' | 'IMPORTING' | 'COMPLETE' | 'TASKS' | 'ERROR';
const CreateCollectionPage: FC<any> = (): ReactElement => {
    const { user: wallet, refreshProfile } = useUser();
    const navigate = useNavigate();
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
    const [filteredWhitelist, setFilteredWhitelist] = useState<string[]>([]);

    // State used by copy minter
    const [nftDetailState, setNftDetailState] = useState<NftDetailState>(DefaultNftDetailState);
    // const [nftImage, setNftImage] = useState<File>();
    // const [preview, setPreview] = useState<any>();

    // Used by both minters
    const [timesState, setTimesState] = useState<TimesState>(DefaultTimesState);

    // Deployment Status
    const [status, setStatus] = useState<Status>()

    // Deployed Minter Address (if using a minter)
    const [minterAddress, setMinterAddress] = useState<string>()
    // Deployed 721 Address
    const [collectionAddress, setCollectionAddress] = useState<string>()

    const [error, setError] = useState<string>()

    const [errorTasks, setErrorTasks] = useState<Task[]>([])
    const [taskMessage, setTaskMessage] = useState<any>()

    useEffect(()=>{
        const ary = whitelistState.raw_addresses.split(/\r?\n/);
        const filtered = ary
            .filter(a=>a.trim() !== '')
            .map(v=>{
                return v.trim()
            }
        );
        setFilteredWhitelist(filtered);
    },[whitelistState.raw_addresses])


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
                    collectionType={collectionType}
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
            // case 'NFT Image':
            //     return <ImagePage
            //         image={nftImage}
            //         preview={preview}
            //         onChange={(data, preview) => {setNftImage(data); setPreview(preview)}}
            //         next={()=>setPage(pages[pages.findIndex(p=>p==='NFT Image')+1])}
            //     />
            case 'Links':
                return <LinksPage
                    state={linkState}
                    onChange={(newState) => setLinkState(newState)}
                    next={()=>setPage(pages[pages.findIndex(p=>p==='Links')+1])}
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
                return <FinishPage
                    finishType='Deploy'
                    collectionType={collectionType as CollectionType}
                    details={detailState}
                    financials={financialState}
                    data={finishState}
                    onChange={(data) => setFinishState(data)}
                    onClick={handleCreate}
                    whitelisted={filteredWhitelist.length}
                    nft_details={nftDetailState}
                    times={timesState}
                />
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    const checkErrors = (newErrorTasks: Task[]) => {
        // Show modal if errors are found
        if (newErrorTasks.length){
            const newErrorContent = (
                <h3>Required information is missing</h3>
            )
            setErrorTasks(newErrorTasks);
            setTaskMessage(newErrorContent);
            setStatus("TASKS")
            return true;
        } else return false;
    }

    const verifyWhitelistState = (whitelist: string[]): Task[] => {
      const returnTasks: Task[] = []

      // Add Error IF whitelist pricing is enabled AND any of the following are true:
      // whitelistAmount is blank
      // whitelist amount is 0 or less
      // payment denom is undefined
      if (
        whitelistState.whitelist_price && (
          whitelistState.amount === ''
          || parseFloat(whitelistState.amount) <= 0
          || !whitelistState.denom
        )
      ) {
        returnTasks.push({
            content: `Enter a whitelist price, or disable whitelist pricing.`,
            onClick: ()=>setPage('Whitelist')
        });
      }

      if (whitelistState.whitelist_price && !whitelist.length){
        returnTasks.push({
          content: `Whitelist pricing is enabled, but no addresses are whitelisted.`,
          onClick: ()=>setPage('Whitelist')
        });
      }

      if (timesState.whitelist_launch_time && !whitelist.length){
        returnTasks.push({
          content: `A whitelist launch time is set, but no addresses are whitelisted.`,
          onClick: ()=>setPage('Whitelist')
        });
      }

      return returnTasks;
    }

    const verifyFinancialState = (required: boolean): Task[] => {
      const noAmount = !financialState.amount || parseFloat(financialState.amount) === 0;
      const noBeneficiary = !financialState.beneficiary_address;
      const returnTasks: Task[] = [];

      if ((noAmount && required) || (!noAmount && noBeneficiary)){
        returnTasks.push({
          content: `Enter a ${
            noAmount ?
              noBeneficiary ?
                    'Sale Amount and Beneficiary'
                :
                    'Sale Amount'
            : noBeneficiary ?
                'Beneficiary'
            : 'UNKNOWN'
          } on the Financials page`,
          onClick: ()=>setPage('Financials')
        })
      };

      if (financialState.beneficiary_address){
        let badAddr = false;
        try {
          const decoded = bech32.decode(financialState.beneficiary_address.trim())
          if (decoded.prefix !== process.env.REACT_APP_NETWORK_PREFIX) throw new Error()
        } catch(e) {
          console.error(e)
          badAddr = true;
        };
        if (badAddr){
          returnTasks.push({
            content: `Invalid Beneficiary Address`,
            onClick: ()=>setPage("Financials")
          })
        }
      }

      return returnTasks;
    };

    const verifyTimes = (randomCollection: boolean) => {
      const oneHour = new Date(new Date().valueOf() + (60 * 60_000));
      const compareTime = randomCollection ? oneHour : new Date();

      const returnTasks: Task[] = [];

      // Ensure random collections have a launch time set
      if (randomCollection && !timesState.launch_time) {
        returnTasks.push({
          content: `Enter a launch time.`,
          onClick: ()=>setPage("Times & Limits")
        });
      }
        
      //Ensure launch time is sufficently in the future
      if (timesState.launch_time && timesState.launch_time.valueOf() < compareTime.valueOf()) {
        returnTasks.push({
          content: `Launch time must be ${randomCollection ? 'at least one hour' : ''} in the future. ${randomCollection ? 'Preloading must be complete before the launch time.' : ''}`,
          onClick: ()=>setPage("Times & Limits")
        });
      }

      // Ensure random collection's whitelist launch time is in the future, if set
      if (randomCollection && timesState.whitelist_launch_time && timesState.whitelist_launch_time.valueOf() < compareTime.valueOf()) {
        returnTasks.push({
          content: `Whitelist launch time must be ${randomCollection ? 'at least one hour' : ''} in the future. ${randomCollection ? 'Preloading must be complete before the launch time.' : ''}`,
          onClick: ()=>setPage("Times & Limits")
        });
      }

      return returnTasks;
    }

    const handleCreate = async (e: any) => {
        if (e) e.preventDefault();
        try {
            if (!wallet) throw new Error('Wallet is not connected.')
            let newNftAddr = collectionAddress;
            if (!collectionAddress){
                setStatus("CREATING")

                const newErrorTasks: Task[] = []

                // #############################################
                // Verify Required Data for ALL Collection Types
                // #############################################
                
                // Basic collection info
                if (!detailState.name || !detailState.symbol){
                    newErrorTasks.push({
                        content:  `Enter a ${
                            !detailState.name ?
                                !detailState.symbol ?
                                    'Name and Symbol'
                                :
                                    'Name'
                            : !detailState.symbol ?
                                'Symbol'
                            : 'UNKNOWN'
                        } for the collection`,
                        onClick: ()=>setPage('Details')
                    })
                }

                // Whitelist
                let whitelist: string[] = [];
                if (whitelistState.raw_addresses !== '') {
                    const raw = whitelistState.raw_addresses.split(/\r?\n/);
                    const filtered = raw.filter(a=>a.trim() !== '');
                    console.log('filtered', filtered)

                    try {
                        whitelist = filtered.map((v, i)=>{
                            v = v.trim().toLowerCase();
                            console.log(v)
                            try {
                                bech32.decode(v);   
                            } catch(err: any){
                                console.error(err);
                                const errorString = err.toString().slice(7)
                                throw new Error(`Invalid whitelisted address ${v}: Address verification failed`)
                            }
                            if (!v.startsWith('archway1')) throw new Error(`Invalid Whitelisted Address: ${v}: Invalid network prefix, expected '${process.env.REACT_APP_NETWORK_PREFIX}'`)

                            return v;
                        })
                    } catch(error: any) {
                        newErrorTasks.push({
                            content:  error.toString().slice(7),
                            onClick: ()=>setPage('Whitelist')
                        })
                    }

                    // whitelist = whitelistState.raw_addresses.split(/\r?\n/);

                    // whitelist.filter(a=>a.trim() !== '').forEach((v, i)=>{
                    //     v = v.trim();
                    //     try {
                    //         bech32.decode(v);

                    //     } catch(err: any){
                    //         const errorString = err.toString().slice(7)
                    //         throw new Error(`Invalid whitelisted address ${v}: Address verification failed ${errorString}`)
                    //     }
                    //     if (!v.startsWith('archway1')) throw new Error(`Invalid Whitelisted Address: ${v}: Invalid network prefix, expected '${process.env.REACT_APP_NETWORK_PREFIX}'`)

                    //     whitelist[i] = v.trim();
                    // })
                }


                // #####################
                // Init Standard Project
                // #####################
                if (collectionType === "STANDARD") {
                    if (checkErrors(newErrorTasks)) return;
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
                // #########################
                // #-----------------------#
                // #- Init Random Project -#
                // #-----------------------#
                // #########################

                    // Check for Errors

                    // Verify whitelist price is set if it is enabled, and that addresses are hitelisted if whitelist features are enabled
                    newErrorTasks.push(...verifyWhitelistState(whitelist))

                    // Verifies that if a sale amount is entered, if it is required. Verifies that a benefeciary is set if needed
                    newErrorTasks.push(...verifyFinancialState(true))

                    // Verify launch and whitelist launch times
                    newErrorTasks.push(...verifyTimes(true))


                    console.log('newErrorTasks', newErrorTasks)
                    // Show Error Tasks
                    if (checkErrors(newErrorTasks)) return;


                    // Init Project
                    const {minterAddress, nftAddress} = await initRandomProject({
                        client: wallet.client, signer: wallet.address,
                        contract: NFT_FACTORY_ADDRESS,
                        nft_admin: wallet.address,
                        minter_admin: wallet.address,
                        beneficiary: financialState.beneficiary_address,
                        nft_name: detailState.name,
                        nft_symbol: detailState.symbol,
                        minter_label: `${detailState.name}_Random_Minter_${randomString(6)}`,

                        launch_time: ((timesState.launch_time as Date).valueOf() / 1000).toString(),
                        whitelist_launch_time: timesState.whitelist_launch_time ? (timesState.whitelist_launch_time.valueOf() / 1000).toString() : undefined,
                        
                        whitelisted: whitelist,
                        mint_limit: timesState.unlimited_limit ? undefined : parseInt(timesState.mint_limit),

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
                        wl_mint_price: whitelistState.whitelist_price ? 
                            whitelistState.denom.nativeDenom ?
                                {
                                    native_payment: {
                                        amount: humanToDenom(whitelistState.amount, whitelistState.denom.decimals),
                                        denom: financialState.denom.nativeDenom as string,
                                    }
                                }
                            : whitelistState.denom.cw20Contract ?
                                {
                                    cw20_payment: {
                                        amount: humanToDenom(whitelistState.amount, whitelistState.denom.decimals),
                                        token: whitelistState.denom.cw20Contract
                                    }
                                }
                            :
                                {
                                    cw20_payment: {
                                        amount: 'error',
                                        token: (()=>{throw new Error('Invalid Denom')}) as unknown as string, // fuck off
                                    }
                                }
                        : undefined,
                    })
                    console.log('Init Result', {minterAddress, nftAddress})
                    setCollectionAddress(nftAddress)
                    newNftAddr = nftAddress;
                
                
                } else if (collectionType === 'COPY') {
                // ##################
                // #----------------#
                // #- Copy Project -#
                // #----------------#
                // ##################
    
                    // Clean NFT Attributes
                    const badAttributes = nftDetailState.attributes.filter((attribute: cw721.Trait)=>
                        (!attribute.trait_type && attribute.value) || (attribute.trait_type && !attribute.value)
                    )
                    const goodAttributes = nftDetailState.attributes.filter(a=>!!a.trait_type && !!a.value);
                    
                    // Clean NFT Details
                    const cleanedNftDetails = { ...nftDetailState, attributes: goodAttributes };

                    // Verify whitelist price is set if it is enabled, and that addresses are whitelisted if whitelist features are enabled
                    newErrorTasks.push(...verifyWhitelistState(whitelist))

                    // If sale amount is entered, verifies that a benefeciary is set.
                    newErrorTasks.push(...verifyFinancialState(false))

                    // Verify launch and whitelist launch times
                    newErrorTasks.push(...verifyTimes(false))

                    // Verify royalty address
                    if (parseInt(financialState.royalty_percent || '0')){
                      let badAddr = false;
                      try {
                        const decoded = bech32.decode(financialState.royalty_address)
                        if (decoded.prefix !== process.env.REACT_APP_NETWORK_PREFIX) throw new Error()
                      } catch(e) {
                        badAddr = true;
                      };
                      if (badAddr){
                        newErrorTasks.push({
                          content: `Invalid Royalty Payment Address`,
                          onClick: ()=>setPage("Financials")
                        })
                      }
                    }

                    // Verify NFT Details
                    if (!cleanedNftDetails.name){
                        newErrorTasks.push({
                            content: `Enter a Name for the NFT`,
                            onClick: ()=>setPage('NFT Details')
                        })
                    }
                    if (!cleanedNftDetails.image) {
                        newErrorTasks.push({
                            content: `Select an Image for the NFT`,
                            onClick: ()=>setPage('NFT Details')
                        })
                    }
                    if (badAttributes.length) {
                        newErrorTasks.push({
                            content: `Make sure all Attributes have a Type and Value`,
                            onClick: ()=>setPage('NFT Details')
                        })
                    }

                    if (checkErrors(newErrorTasks)) return;

                    //@ts-expect-error
                    const cid = await uploadImage(cleanedNftDetails.image);

                    const mint_price = 
                      (!parseFloat(financialState.amount || '0')) ? undefined
                      : financialState.denom.nativeDenom ? 
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
                    ;
                    
                    const whitelist_mint_price = 
                      !whitelistState.whitelist_price ? undefined
                      : !whitelistState.amount ? undefined
                      : whitelistState.denom.nativeDenom ?
                        {
                          native_payment: {
                            amount: humanToDenom(whitelistState.amount, whitelistState.denom.decimals),
                            denom: financialState.denom.nativeDenom as string,
                          }
                        }
                      : whitelistState.denom.cw20Contract ?
                        {
                          cw20_payment: {
                            amount: humanToDenom(whitelistState.amount, whitelistState.denom.decimals),
                            token: whitelistState.denom.cw20Contract
                          }
                        }
                      :
                        {
                          cw20_payment: {
                            amount: 'error',
                            token: (()=>{throw new Error('Invalid Denom')}) as unknown as string, // fuck off
                          }
                        }
                    ;
                    
                    // Init Project
                    const {minterAddress, nftAddress} = await initCopyProject({
                      client: wallet.client, signer: wallet.address,
                      contract: NFT_FACTORY_ADDRESS,

                      nft_admin: wallet.address,
                      minter_admin: wallet.address,
                      beneficiary: financialState.beneficiary_address,

                      launch_time: timesState.launch_time ? (timesState.launch_time.valueOf() / 1000).toString() : undefined,
                      whitelist_launch_time: timesState.whitelist_launch_time ? (timesState.whitelist_launch_time.valueOf() / 1000).toString() : undefined,
                      end_time: timesState.end_time ? (timesState.end_time.valueOf() / 1000).toString() : undefined,

                      mint_limit: timesState.unlimited_limit ? undefined : parseInt(timesState.mint_limit),
                      max_copies: timesState.unlimited_copies ? undefined : parseInt(timesState.max_copies),
                      whitelisted: whitelist,

                      nft_name: detailState.name,
                      nft_symbol: detailState.symbol,
                      minter_label: `${detailState.name}_Copy_Minter_${randomString(6)}`,
                      nft_label: `Architech_Copy_Collection_${detailState.name.trim()}_${Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64")}}`,
                      metadata: {
                        name: cleanedNftDetails.name,
                        description: cleanedNftDetails.description,
                        attributes: cleanedNftDetails.attributes,
                        external_url: cleanedNftDetails.externalLink ? cleanedNftDetails.externalLink : undefined,
                        royalty_payment_address: financialState.royalty_address ? financialState.royalty_address : undefined,
                        royalty_percentage: parseInt(financialState.royalty_percent || '0') ? parseInt(financialState.royalty_percent) : undefined,
                        image: `ipfs://${cid}`,
                      },
                      mint_price,
                      whitelist_mint_price,
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
            setTaskMessage(
              <div>
                Collection
                <h5>{detailState.name}</h5>
                has been created.<br /><br />
                Here's some things to do next:
              </div>)
        } catch(err: any) {
            console.error(err)
            setStatus("ERROR")
            setError(parseError(err));
        } finally {
        }
    }

    const finishTasks: Task[] = [
        {
            content: 'View your Collection',
            onClick: ()=>navigate(`/nfts/${collectionAddress}`)
        },

    ]
    if (collectionType === 'COPY') finishTasks.push({
        content: 'View your Minter',
        onClick: ()=>navigate(`/nfts/mint/${collectionAddress}`)
    })
    if (collectionType === 'RANDOM') finishTasks.push({
        content: 'Preload NFTs into the Minter',
        onClick: ()=>navigate(`/nfts/edit/${collectionAddress}/preload`)
    })
    if (collectionType === 'STANDARD') finishTasks.push({
        content: 'Setup Archway Rewards',
        onClick: ()=>navigate(`/nfts/edit/${collectionAddress}/rewards`)
    });

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
                  <Col>
                    <button type='button' onClick={()=>selectType('STANDARD')} >
                        <h3>Standard Collection</h3>
                        <p className='lightText12'>
                            Create NFTs one at a time. Create more in the same collection any time. 
                            Great for small collections and one-off art.
                        </p>
                    </button>
                  </Col>
                  <Col>
                    <button type='button' onClick={()=>selectType('RANDOM')} disabled={DISABLED_FEATURES.includes('RANDOMMINT')} >
                        <h3>Random Minter</h3>
                        <p className='lightText12'>
                            Preload NFTs in bulk, then distribute them one at a time randomly. 
                            Great for PFP collectons.
                        </p>
                        {DISABLED_FEATURES.includes('RANDOMMINT') && <h5>Available Soon</h5> }
                    </button>
                  </Col>
                  <Col>
                    <button type='button' onClick={()=>selectType('COPY')} disabled={DISABLED_FEATURES.includes('COPYMINT')} >
                        <h3>Copy Minter</h3>
                        <p className='lightText12'>
                            Sell or give away copies of an NFT. Optionally limit by number of copies or time. 
                            Great for tickets and limited edition art.
                        </p>
                        {DISABLED_FEATURES.includes('COPYMINT') && <h5>Available Soon</h5> }
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
        <TasksModal open={status==='TASKS' || status==='COMPLETE'} close={()=>setStatus(undefined)} tasks={status==='TASKS' ? errorTasks : finishTasks} content={taskMessage} />
        <Modal open={!!status && status!=='TASKS' && status!=='COMPLETE'} locked={true} onClose={()=>{}} >
            <Row className="px-4 pt-4">
                <Col style={{textAlign: 'center'}}>
                    { status === "CREATING" && <><p>Deploying collection...</p><Loader /></>}
                    { status === "IMPORTING" && <><p>Importing collection into Architech...</p><Loader /></>}
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