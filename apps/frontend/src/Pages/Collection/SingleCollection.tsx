import { Collection, GetCollectionResponse, Token } from "@architech/types";
import React, {ReactElement, FC, useState, useEffect, CSSProperties} from "react";
import { Col, Container, Row, Image } from "react-bootstrap";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import CollectionStats from "../../Components/CollectionStats/CollectionStats";
import FilterMenu from "../../Components/FilterMenu";
import Modal from "../../Components/Modal";
import NftTile from "../../Components/NftTile/NftTile";
import SocialLinks from "../../Components/Socials";
import { useUser } from "../../Contexts/UserContext";
import { getTokens } from "../../Utils/backend";
import { getCollectionName } from "../../Utils/helpers";
import BannerModal from "./BannerModal";
import EditModal from "./EditModal";
import PictureModal from "./PictureModal";

const statusOptions = [
    'For Sale',
    'Test Option',
]

const SingleCollection: FC<any> = (): ReactElement => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
      const currentParams = Object.fromEntries([...searchParams]);
      console.log(currentParams); // get new values onchange
    }, [searchParams]);
    
    const [tokens, setTokens] = useState<Token[]>([])
    const { collection: fullCollection } = useLoaderData() as { collection: GetCollectionResponse};
    const collection = fullCollection?.collection; 
    const { user: wallet, authenticated } = useUser();

    const [isEditing, setIsEditing] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string[]>([])

    const loadTokens = async() => {
        const fetchTokens = await getTokens(collection.address)
        console.log('FetchTokens', fetchTokens);

        setTokens(fetchTokens);
    }

    useEffect(()=>{
        if (!collection) return;
        loadTokens()
    },[collection])

    const bgStyle: CSSProperties = collection.collectionProfile.banner_image ?
        {
            backgroundImage: `url('/api/public/${collection.collectionProfile.banner_image}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
        }
    : {};

    const collectionName = getCollectionName(collection);
    const collectionImage = collection.collectionProfile?.profile_image ? `/api/public/${collection.collectionProfile?.profile_image}` : tokens[0]?.metadataExtension?.image || tokens[0]?.metadataExtension?.image_data || undefined;
    return (
        <>
            <EditModal open={isEditing} onClose={()=>setIsEditing(false)} collectionId={collection._id} />
            {/* <Modal open={updateImage} onClose={()=>{setUpdateImage(false)}}>
            <Row>
            <Col xs={12} md={6}>
                <form onSubmit={saveImage}>
                    <Row>
                        <Col xs="auto">
                            <span>Image:</span>
                        </Col>
                        <Col xs="auto">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col xs="auto">
                            <button type="submit" disabled={!image}>Save Image</button>
                        </Col>
                    </Row>
                </form>
                </Col>
            </Row>
        </Modal> */}

            {/* {!!collection && 
            <>
                <div style={{width: '100vw', maxHeight: '320px', overflow: 'hidden', position: 'absolute', zIndex: -5, background: 'linear-gradient(to bottom left, rgb(345, 123, 98), rgb(12, 211, 123), rgb(123, 231, 11))', paddingTop: collection.collectionProfile?.banner_image ? undefined : '300px' }}>
                    { !!collection.collectionProfile?.banner_image &&
                        <img alt={collectionName} style={{width: '100vw'}} src={`/api/public/${collection.collectionProfile?.banner_image}`} />
                    }    
                </div>
                    <Row>
                        <Col xs={6} md={2}>
                            <img alt={collectionName} style={{width: '100%'}} src={collectionImage} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h3 style={{margin: 0}}>{collection.cw721_name}</h3>
                            <h6 style={{margin: 0}}>Created By: <Link to={`/profile/${collection.creator}`}>{collection.creator}</Link></h6>
                            <p style={{paddingLeft: '10px'}}>{collection.totalTokens} Items</p>
                        </Col>
                            <Col>
                                <button type="button" onClick={()=>setUpdateImage(true)}>Change Image</button>
                                <button type="button" onClick={()=>setUpdateBanner(true)}>Change Banner</button>
                            </Col>

                    </Row>
            </>
            } */}
                <div className='d-flex mb8' style={{gap: '8px', margin: '0 -8px', maxHeight: '350px'}}>
                    <Col xs={{span: 10, offset: 1}} md={{span: 3, offset: 0}} className='card' style={{aspectRatio: '1 / 1'}}>
                        <img src={collectionImage} style={{objectFit: 'cover', width: '100%', height: '100%'}}></img>
                    </Col>
                    <Col
                        className='card'
                        style={{
                            position: 'relative',
                            ...bgStyle,
                        }}
                    >
                        {/* {!!collection.collectionProfile.banner_image && <img src={`/api/public/${collection.collectionProfile.banner_image}`} className='wide imgCover' /> } */}
                        <div className='d-flex flex-column genOverlay' style={{position: 'absolute', left: '16px', bottom: '16px'}}>
                            <h1>{collectionName}</h1>
                            <p>{collection.collectionProfile.description}</p>
                            <div className='d-flex wide justify-content-space-between'>
                                <CollectionStats collection={collection} forSale={fullCollection.forSale.length} />
                            </div>
                        </div>
                        <div style={{position: 'absolute', right: '16px', top: '16px'}}>
                                    {/* { (authenticated && collection.creator === wallet?.address) && */}
                                    <Col>
                                        <button type="button" onClick={()=>setIsEditing(true)}>Edit</button>
                                    </Col>
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
                        </div>
                    </Col>
                    
                    {tokens.length ?
                        <Col className='grid-4 wide'>
                            {tokens.map(token=>{
                                return (
                                    <NftTile collectionName={collectionName} token={token} />
                                );
                            })}
                        </Col>
                    :
                        <Col className='card' style={{textAlign: 'center', padding: '32px 0'}}>
                            <h2 className='mb16'>This collection doesn't have any NFTs yet.</h2>
                            { (collection.creator === wallet?.address || collection.admin === wallet?.address) &&
                                <button>
                                    Create an NFT
                                </button>
                            }
                        </Col>
                    }
                    {/* <Col className='d-flex flex-wrap gx-5'>
                    {
                                    tokens.map(token=>{
                                        return (
                                            <NftTile collectionName={collectionName} token={token} />
                                        );
                                    })
                                }
                    </Col> */}
                </div>
                {/* <Row>
                    <Col xs={12} md={9}>
                        {!!tokens.length &&
                        <>
                            <Row className="g-4" style={{flexWrap: 'wrap'}}>
                                {
                                    tokens.map(token=>{
                                        return (
                                            <NftTile collectionName={collectionName} token={token} />
                                        );
                                    })
                                }
                            </Row>
                        </>
                        }
                    </Col>
                </Row> */}

        </>
    );
};

export default SingleCollection;