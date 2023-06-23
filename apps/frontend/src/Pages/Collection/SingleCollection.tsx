import { Collection, cw721, GetCollectionResponse, SortOption, Token } from "@architech/types";
import React, {ReactElement, FC, useState, useEffect, CSSProperties} from "react";
import { Col, Container, Row, Image } from "react-bootstrap";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import Badge from "../../Components/Badge";
import CollectionStats from "../../Components/CollectionStats/CollectionStats";
import FilterMenu from "../../Components/FilterMenu";
import { TraitFilterMenu } from "../../Components/FilterMenu/FilterMenu";
import LinkButton from "../../Components/LinkButton";
import Modal from "../../Components/Modal";
import NftTile from "../../Components/NftTile/NftTile";
import SocialLinks from "../../Components/Socials";
import SortByButton from "../../Components/SortByButton";
import { sortOptions } from "../../Components/SortByButton/SortByButton";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl, getTokens } from "../../Utils/backend";
import { getCollectionName } from "../../Utils/helpers";
import BannerModal from "./BannerModal";
import EditModal from "./EditModal";
import PictureModal from "./PictureModal";

const statusOptions = [
    'For Sale',
    // 'Test Option',
]

const SingleCollection: FC<any> = (): ReactElement => {
    const [searchParams, setSearchParams] = useSearchParams();

    // useEffect(() => {
    //   const currentParams = Object.fromEntries([...searchParams]);
    // }, [searchParams]);
    
    const [tokens, setTokens] = useState<Token[]>([])
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const collection = fullCollection?.collection; 
    const { user: wallet } = useUser();

    const [isEditing, setIsEditing] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [traitFilter, setTraitFilter] = useState<Partial<cw721.Trait>[]>([]);
    
    const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
    const [page, setPage] = useState(1);

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
        // setSearchParams({ traits: JSON.stringify(newFilter) })
    }

    const removeTraitFilter = (trait: cw721.Trait) => {
        const index = traitFilter.findIndex(t=>t.trait_type === trait.trait_type && t.value === trait.value);
        if (index === -1) return;
        const newFilter = [...traitFilter];
        newFilter.splice(index, 1);
        setTraitFilter(newFilter)
        setSearchParams({ traits: JSON.stringify(newFilter) })
    }

    const loadTokens = async(pageNumber = page) => {
        let fetchTokens = await getTokens(collection.address, searchParams, sortBy, 1, pageNumber*32)
        if (statusFilter.includes('For Sale')) {
            const filtered = fetchTokens.filter(t=>fullCollection.asks.findIndex(ask=>ask.token_id===t.tokenId) > -1)
            fetchTokens = filtered;
        }
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

    useEffect(()=>{
        if (!collection) return;

        loadTokens()
    },[collection, traitFilter, statusFilter, sortBy])

    const bgStyle: CSSProperties = collection.collectionProfile.banner_image ?
        {
            backgroundImage: `url('${getApiUrl(`/public/${collection.collectionProfile.banner_image}`)}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
        }
    : {};

    const collectionName = getCollectionName(collection);
    const collectionImage = collection.collectionProfile?.profile_image ? getApiUrl(`/public/${collection.collectionProfile?.profile_image}`) : tokens[0]?.metadataExtension?.image || tokens[0]?.metadataExtension?.image_data || undefined;

    return (
        <>
            <EditModal open={isEditing} onClose={()=>setIsEditing(false)} collectionId={collection._id} />
            <div className='d-flex mb8' style={{gap: '8px', margin: '0 -8px', maxHeight: '350px'}}>
                <Col xs={{span: 10, offset: 1}} md={{span: 3, offset: 0}} className='card' style={{aspectRatio: '1 / 1'}}>
                    <img alt={collectionName} src={collectionImage} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                </Col>
                <Col
                    className='card'
                    style={{
                        position: 'relative',
                        ...bgStyle,
                    }}
                >
                    <div className='d-flex flex-column genOverlay' style={{position: 'absolute', left: '16px', bottom: '16px'}}>
                        <div className='d-flex align-items-center gap8'>
                            <h1>{collectionName}</h1>
                            {(collection.categories || []).map(category=>
                                <Badge><span>{category}</span></Badge>
                            )}
                        </div>
                        <p>{collection.collectionProfile.description}</p>
                        <div className='d-flex wide justify-content-space-between'>
                            <CollectionStats collection={collection} asks={fullCollection.asks} />
                        </div>
                    </div>
                    <div style={{position: 'absolute', right: '16px', top: '16px'}}>
                                { (wallet && collection.creator === wallet.address) &&
                                <Col>
                                    <button type="button" onClick={()=>setIsEditing(true)}>Edit</button>
                                </Col>
                                }
                            </div>
                    <div style={{position: 'absolute', right: '16px', bottom: '16px'}}>
                        <SocialLinks discord={collection.collectionProfile.discord} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} />
                    </div>

                </Col>
            </div>
            <div className='d-flex align-items-start' style={{gap: '8px', margin: '0 -8px'}}>
                <Col xs={12} md={3} className='card d-flex flex-column'>
                    <div style={{margin: '24px'}}>
                        <FilterMenu title={'Status'} options={statusOptions} selected={statusFilter} setOptions={(selected)=>setStatusFilter(selected)}  />

                        <div style={{marginTop: '32px', marginBottom: '16px'}} className='lightText12'>Traits</div>
                        { collection.traitTypes.map(type=>{
                            const traits = collection.traits.filter((trait: cw721.Trait)=>trait.trait_type === type);
                            const selected = traitFilter.filter((trait: Partial<cw721.Trait>)=>trait.trait_type === type);
                            const values = traits.map(t=>t.value);
                            return (
                                <div key={type} className='mb8'>
                                    <TraitFilterMenu trait_type={type} traits={traits} selected_traits={selected} onCheck={(trait)=>addTraitFilter(trait)} onUncheck={(trait)=>removeTraitFilter(trait)}  />
                                </div>
                            )
                        })}
                    </div>
                </Col>
                
                {tokens.length ?
                    <Col className='grid-4 wide'>
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
            <div className='d-flex mb8 mt8 gap8 justify-content-center' style={{gap: '8px', margin: '0 -8px', maxHeight: '350px'}}>
                <Col xs="auto">
                    <SortByButton selectedOption={sortBy} setSelected={(option) => updateSortBy(option)} />
                </Col>
                { tokens.length === 32*page &&
                <Col xs="auto">
                    <button type='button' onClick={()=>loadMore()}>Load More</button>
                </Col>
                }

            </div>

        </>
    );
};

export default SingleCollection;