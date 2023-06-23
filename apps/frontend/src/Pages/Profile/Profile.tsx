import { GetUserProfileResponse, Token, User } from "@architech/types";
import React, {ReactElement, FC, useState, useEffect, ChangeEvent} from "react";
import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FileInput from "../../Components/FileInput";
import ImageDropzone from "../../Components/ImageDropzone";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl, getTokens, updateProfile, updateProfileImage } from "../../Utils/backend";
import { useRevalidator } from 'react-router-dom'
import Loader from "../../Components/Loader";
import NftTile from "../../Components/NftTile/NftTile";
import CollectionTile from "../../Components/CollectionTile/CollectionTile";
import PageSelector from "../../Components/PageSelector/PageSelector";
import EditProfileModal from "./EditProfileModal";
import LinkButton from "../../Components/LinkButton";

const emptyToUndefined =(str: string) => {
    return str.length ? str : undefined;
}

type Page = 'Owned NFTs' | 'Created Collections' | 'Likes'

const Pages: Page[] = [
    'Owned NFTs',
    'Created Collections',
    // 'Likes',
]

const ProfilePage: FC<any> = (): ReactElement => {
    const { userProfile } = useLoaderData() as { userProfile: GetUserProfileResponse };
    const { userAddress } = useParams();
    const { user: wallet } = useUser();
    const revalidator = useRevalidator();
    const [editProfile, setEditProfile] = useState<boolean>(false)

    const [page, setPage] = useState<Page>(Pages[0]);

    console.log('userAddress', userAddress)
    console.log('userProfile', userProfile)
    if (!userProfile)
        return (
            <Row>
            <Col xs="auto" className="justify-content-center">
                <Loader />
            </Col>
            </Row>
        )

    const getPage = (_page: Page) => { 
        switch(_page){
            case "Owned NFTs": 
                return (
                    userProfile.tokens.length ?
                        <Col className='grid-4 wide'>
                            {userProfile.tokens.map(token=>{
                                return (
                                    <NftTile token={token} />
                                );
                            })}
                        </Col>
                    :
                        <Col className='card d-flex flex-columnm justify-content-center' style={{textAlign: 'center', padding: '32px 0'}}>
                            <div style={{margin: 'auto'}}>
                            { (userProfile.profile.address === wallet?.address) ?
                                <>
                                    <h2 className='mb16'>You don't own any NFTs yet.</h2>
                                    <LinkButton to='/nfts'>
                                        Start Collecting
                                    </LinkButton>
                                </>
                                :
                                <h2 className='mb16'>This user doesn't own any NFTs yet.</h2>
                            }
                            </div>

                            {/* <h2 className='mb16'>This user doesn't own any NFTs yet.</h2>
                            { (userProfile.profile.address === wallet?.address) &&
                                <button>
                                    Create an NFT
                                </button>
                            } */}
                        </Col>
                );
            case "Created Collections":
                return (
                    userProfile.collections.length ?
                        <Col className='grid-4 wide'>
                            {userProfile.collections.map(collection=>{
                                return (
                                    <CollectionTile fullCollection={collection} />
                                );
                            })}
                        </Col>
                    :
                        <Col className='card d-flex flex-columnm justify-content-center' style={{textAlign: 'center', padding: '32px 0'}}>
                            <div style={{margin: 'auto'}}>
                            { (userProfile.profile.address === wallet?.address) ?
                                <>
                                    <h2 className='mb16'>You haven't created any collections yet.</h2>
                                    <button>
                                        Start Creating
                                    </button>
                                </>

                                :
                                <h2 className='mb16'>This user hasn't created any collections yet.</h2>
                            }
                            </div>

                        </Col>
                );
        }
    }


    const displayName = userProfile?.profile?.username || userAddress
    const displayImage = userProfile.profile.profile_image ? getApiUrl(`/public/${userProfile.profile.profile_image}`) : undefined;
    return (<>
                <EditProfileModal open={editProfile} onClose={()=>setEditProfile(false)} userId={userProfile.profile._id} />
                <div className='d-flex mb8' style={{gap: '8px', margin: '0 -8px', maxHeight: '350px'}}>
                    <Col xs={{span: 10, offset: 1}} md={{span: 3, offset: 0}} className='card' style={{aspectRatio: '1 / 1'}}>
                        <img src={displayImage} alt={ displayName } style={{objectFit: 'cover', width: '100%', height: '100%'}}></img>
                    </Col>
                    <Col
                        className='card'
                        style={{
                            position: 'relative',
                            // ...bgStyle,
                        }}
                    >
                        {/* {!!collection.collectionProfile.banner_image && <img src={getApiUrl(`/public/${collection.collectionProfile.banner_image}`} className='wide imgCover' /> } */}
                        <div className='d-flex flex-column genOverlay' style={{position: 'absolute', left: '16px', bottom: '16px'}}>
                            <h1>{displayName}</h1>
                            <p>{userProfile.profile.bio}</p>
                            <div className='d-flex wide justify-content-space-between'>
                                {/* <CollectionStats collection={collection} /> */}

                            </div>
                        </div>
                        <div style={{position: 'absolute', right: '16px', top: '16px'}}>
                                    { (wallet && wallet.address === userProfile.profile.address) &&
                                        <Col>
                                            <button type="button" onClick={()=>setEditProfile(true)}>Edit</button>
                                        </Col>
                                    }
                                </div>
                        <div style={{position: 'absolute', right: '16px', bottom: '16px'}}>
                            {/* <SocialLinks discord={userProfile.profile.} twitter={collection.collectionProfile.twitter} website={collection.collectionProfile.website} /> */}
                        </div>

                    </Col>
                </div>
                <div className='d-flex' style={{gap: '8px', margin: '0 -8px', alignItems: 'stretch'}}>
                    <Col xs={12} md={3} className='card d-flex flex-column'>
                        <div style={{margin: '24px'}}>
                            <PageSelector pages={Pages} current={page} setPage={(newPage: any)=>setPage(newPage)} />
                        </div>
                    </Col>
                    
                    {getPage(page)}
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

    </>
    );
};

export default ProfilePage;