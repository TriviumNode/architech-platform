import { cw721, GetCollectionResponse, SortOption, Token } from "@architech/types";
import {ReactElement, FC, useState, useEffect, CSSProperties} from "react";
import { Col } from "react-bootstrap";
import { Link, useLoaderData, useRevalidator, useSearchParams } from "react-router-dom";
import Badge from "../../Components/Badge";
import CollectionStats from "../../Components/CollectionStats/CollectionStats";
import FilterMenu from "../../Components/FilterMenu";
import { TraitFilterMenu } from "../../Components/FilterMenu/FilterMenu";
import LinkButton from "../../Components/LinkButton";
import NftTile from "../../Components/NftTile/NftTile";
import PlaceholdImg from "../../Components/PlaceholdImg";
import SocialLinks from "../../Components/Socials";
import SortByButton from "../../Components/SortByButton";
import { tokenSortOptions } from "../../Components/SortByButton/SortByButton";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl, getTokens, refreshCollection } from "../../Utils/backend";
import { getCollectionName } from "../../Utils/helpers";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { toast } from "react-toastify";
import sleep from "../../Utils/sleep";
import { Tooltip } from "react-tooltip";
import { isAdmin, isCollectionCreator } from "@architech/lib";

import styles from './Collection.module.scss';
import VerifiedBadge from "../../Components/Verified";
import HiddenBanner from "../../Components/HiddenBanner/HiddenBanner";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import { DevInfo } from "../../Interfaces/interfaces";
import RefreshButton from "../../Components/RefreshButton";

const statusOptions = [
    'For Sale',
    // 'Test Option',
]

const SingleCollection: FC<any> = (): ReactElement => {
    const [searchParams, setSearchParams] = useSearchParams();

    // useEffect(() => {
    //   const currentParams = Object.fromEntries([...searchParams]);
    // }, [searchParams]);
    const revalidator = useRevalidator();
    
    const [tokens, setTokens] = useState<Token[]>([])
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const collection = fullCollection?.collection; 
    const { user: wallet, devMode } = useUser();

    const [isEditing, setIsEditing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [traitFilter, setTraitFilter] = useState<Partial<cw721.Trait>[]>([]);
    
    const [sortBy, setSortBy] = useState<SortOption>(tokenSortOptions[0])
    const [page, setPage] = useState(1);
    
    const [devInfo, setDevInfo] = useState<DevInfo>()

    // Set filter state from URL searchParams on initial render
    useEffect(()=>{
      const newStatus = [...statusFilter];
      if (
        searchParams.has('sale')
        && searchParams.get('sale') === 'true'
        && !newStatus.includes('For Sale')
      ) {
        newStatus.push('For Sale')
      }
      setStatusFilter(newStatus);

      if (
        searchParams.has('sortBy')
        && tokenSortOptions.includes(searchParams.get('sortBy') as SortOption)
      ) setSortBy(searchParams.get('sortBy') as SortOption);
    },[])

    const getDevInfo = async() => {
      if (!devMode) return;
      try {
        const contract = await QueryClient.getContract(fullCollection.collection.address)
        const code = await QueryClient.getCodeDetails(contract.codeId)
        const metadata = await QueryClient.getContractMetadata(fullCollection.collection.address)
        const premium = await QueryClient.getContractPremium(fullCollection.collection.address)
        setDevInfo({contract, code, metadata, premium})
      } catch(err) {
        console.error(err)
        toast.error('Failed to load dev info. See the console for more information.')
      }
    }

    useEffect(()=>{
      getDevInfo();
    },[devMode])

    const addTraitFilter = (trait: cw721.Trait) => {
        Object.keys(trait).forEach((key: any)=>{
            //@ts-expect-error
            if (trait[key] === null || trait[key] === undefined) delete trait[key]
        })
        if (traitFilter.findIndex(t=>t.trait_type === trait.trait_type && t.value === trait.value) > -1) return;
        const newFilter = [...traitFilter, trait]
        setTraitFilter(newFilter)
        searchParams.set('traits', JSON.stringify(newFilter));
        setSearchParams(searchParams);
    }

    const removeTraitFilter = (trait: cw721.Trait) => {
        const index = traitFilter.findIndex(t=>t.trait_type === trait.trait_type && t.value === trait.value);
        if (index === -1) return;
        const newFilter = [...traitFilter];
        newFilter.splice(index, 1);
        setTraitFilter(newFilter)
        searchParams.set('traits', JSON.stringify(newFilter))
        setSearchParams(searchParams);
    }

    const loadTokens = async(pageNumber = page) => {
        let fetchTokens = await getTokens(
          collection.address,
          searchParams,
          sortBy,
          1,
          pageNumber*32,
        )
        setTokens(fetchTokens);
    }

    const updateSortBy = (newSort: SortOption) => {
        searchParams.set('sortBy', newSort);
        setSearchParams(searchParams);

        setSortBy(newSort);
    }

    const loadMore = async () => {
        const newPage = page+1
        setPage(newPage);

        let moreTokens = await getTokens(collection.address, searchParams, sortBy, newPage)
        setTokens([...tokens, ...moreTokens]);
    }

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await refreshCollection(collection.address);
            await sleep(750)
            revalidator.revalidate()
        } catch (err: any) {
            console.error('Error refreshing collection:', err);
            toast.error(err.toString())
        } finally {
            setIsRefreshing(false);
        }
    }

    const handleChangeStatusFilter = () => {
      if (statusFilter.includes('For Sale')) {
        searchParams.set('sale', 'true')
      } else {
        searchParams.delete('sale')
      }
      setSearchParams(searchParams);
    }

    useEffect(() => {
      handleChangeStatusFilter();
    },[statusFilter]);

    useEffect(()=>{
        if (!collection) return;

        loadTokens()
    },[collection, traitFilter, sortBy, searchParams])

    const bgStyle: CSSProperties = collection.collectionProfile.banner_image ?
        {
            backgroundImage: `url('${getApiUrl(`/public/${collection.collectionProfile.banner_image}`)}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            color: !!collection.collectionProfile.dark_banner ? 'white' : undefined,
        }
    : {};

    const collectionName = getCollectionName(collection);
    const collectionImage = collection.collectionProfile?.profile_image ? getApiUrl(`/public/${collection.collectionProfile?.profile_image}`) : tokens[0]?.metadataExtension?.image || tokens[0]?.metadataExtension?.image_data || undefined;

    return (
        <>
          {!!collection.hidden &&
            <HiddenBanner page='COLLECTION' collectionAddress={collection.address} />
          }
            <div className={styles.picRow}>
                <Col xs={{span: 8, offset: 2}} md={{span: 3, offset: 0}} className='card' style={{aspectRatio: '1 / 1'}}>
                    <PlaceholdImg alt={collectionName} src={collectionImage} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                </Col>
                <Col
                    xs={12}
                    md={true}
                    className='card'
                    style={{
                        position: 'relative',
                        minHeight: '240px',
                        ...bgStyle,
                    }}
                >
                        <div className='d-flex flex-column genOverlay' style={{position: 'absolute', left: '16px', bottom: '16px'}}>
                            <div className='d-flex align-items-center gap8'>
                                <h1>{collectionName}</h1>
                                {!!collection.verified &&
                                  <VerifiedBadge content="Collection" />
                                }
                                {(collection.categories || []).map(category=>
                                    <Badge key={category}><span>{category}</span></Badge>
                                )}
                            </div>
                            <p>{collection.collectionProfile.description}</p>
                            <div className='d-flex wide justify-content-space-between'>
                                <CollectionStats collection={collection} asks={fullCollection.asks} />
                            </div>
                        </div>

                        {/* ### Dev Mode Info ### */}
                        {devMode && 
                          <>{
                            !!devInfo ?
                              <div>
                                Code ID: {devInfo.contract.codeId}&nbsp;&nbsp;&nbsp;&nbsp;Hash: {devInfo.code.checksum}
                              </div>
                            :
                              <SmallLoader />  
                          }</>
                        }

                        <div style={{position: 'absolute', right: '16px', top: '16px'}}>
                            {/* { (wallet && (collection.creator === wallet.address || ADMINS.includes(wallet.address))) && */}
                            { (wallet && (isCollectionCreator(wallet.address, collection) || isAdmin(wallet.address))) &&
                                <Col className='d-flex flex-col justify-content-center'>
                                    {/* <button type="button" onClick={()=>setIsEditing(true)}>Edit</button> */}
                                    {/* <button
                                        data-tooltip-id="my-tooltip"
                                        data-tooltip-content="Refresh Collection"
                                        data-tooltip-place="left"
                                        disabled={isRefreshing}
                                        onClick={()=>handleRefresh()}
                                        style={{color: '#666666', padding: 0}}
                                        type='button'
                                        className='clearButton mr16'
                                    >
                                        <FontAwesomeIcon spin={isRefreshing} size='2x' icon={faArrowRotateRight} />
                                    </button> */}
                                    <RefreshButton color={collection.collectionProfile.dark_banner ? '#999' : '#666'} refreshWhat="Collection" spin={isRefreshing} disabled={isRefreshing} onClick={()=>handleRefresh()} />
                                    <LinkButton
                                        style={{color: '#666666', padding: 0, background: '#00000000'}}
                                        to={`/nfts/edit/${collection.address}`}

                                    >
                                        <FontAwesomeIcon
                                            data-tooltip-id="my-tooltip"
                                            data-tooltip-content="Edit Collection"
                                            data-tooltip-place="left"
                                            size='2x' icon={faPencil}
                                            color={collection.collectionProfile.dark_banner ? '#999' : '#666'}
                                        />
                                    </LinkButton>
                                    <Tooltip id="my-tooltip" />

                                </Col>
                            }
                        </div>
                        <div style={{position: 'absolute', right: '16px', bottom: '16px'}}>
                            <SocialLinks color={collection.collectionProfile.dark_banner ? '#999' : '#666'} discord={collection.collectionProfile.discord} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} />
                        </div>
                </Col>
            </div>
            <div className='d-flex align-items-start flex-wrap' style={{gap: '8px'}}>
                <Col xs={12} md={3} className='card d-flex flex-column'>
                    <div style={{margin: '24px'}}>
                        <FilterMenu title={'Status'} options={statusOptions} selected={statusFilter} setOptions={(selected)=>setStatusFilter(selected)}  />

                        <div style={{marginTop: '32px', marginBottom: '16px'}} className='lightText12'>Traits</div>
                        { collection.traitTypes.map(type=>{
                            const traits = collection.traits.filter((trait: cw721.Trait)=>trait.trait_type === type);
                            const selected = traitFilter.filter((trait: Partial<cw721.Trait>)=>trait.trait_type === type);
                            return (
                                <div key={type} className='mb8'>
                                    <TraitFilterMenu trait_type={type} traits={traits} selected_traits={selected} onCheck={(trait)=>addTraitFilter(trait)} onUncheck={(trait)=>removeTraitFilter(trait)}  />
                                </div>
                            )
                        })}
                    </div>
                </Col>
                
                {tokens.length || collection.collectionMinter ?
                    <Col className={styles.nftsContainer}>
                        {!!collection.collectionMinter && 
                            <Link
                              to={`/nfts/mint/${collection.address}`}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#666666',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                                <h4>Minting Now</h4>
                                <p>Click to see Minter</p>
                            </Link>
                        }
                        {tokens.map(token=>{
                            return (
                                <NftTile collectionName={collectionName} token={token} key={token.tokenId} />
                            );
                        })}
                    </Col>
                : !collection.totalTokens ?
                    <Col className='card' style={{textAlign: 'center', padding: '32px 0'}}>
                        <h2 className='mb16'>This collection doesn't have any NFTs yet.</h2>
                        { (collection.creator === wallet?.address || collection.admin === wallet?.address) &&
                            <LinkButton to={`/nfts/create/${collection.address}`}>
                                Create an NFT
                            </LinkButton>
                        }
                    </Col>
                : 
                <Col className='card' style={{textAlign: 'center', padding: '32px 0'}}>
                    <h2 className='mb16'>No NFTs found.</h2>
                </Col>
                }
            </div>
            <div
                className='d-flex mb8 mt8 justify-content-center'
                style={{
                    margin: '0 -8px',
                    maxHeight: '350px',
                }}
            >
                <div
                    className='d-flex gap8 br8 justify-content-center'
                    style={{
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.80)',
                        backdropFilter: 'blur(12px)',
                        width: 'auto'   
                    }}
                >
                <Col xs="auto">
                    <SortByButton selectedOption={sortBy} setSelected={(option) => updateSortBy(option)} sortOptions='TOKEN' />
                </Col>
                { tokens.length === 32*page &&
                  <Col xs="auto">
                      <button type='button' onClick={()=>loadMore()}>Load More</button>
                  </Col>
                }

            </div>
            </div>
        </>
    );
};

export default SingleCollection;