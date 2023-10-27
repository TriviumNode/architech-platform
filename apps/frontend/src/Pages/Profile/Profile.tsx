import { GetUserProfileResponse } from "@architech/types";
import {ReactElement, FC, useState} from "react";
import { Col, Row } from "react-bootstrap";
import { useLoaderData, useParams } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { getApiUrl } from "../../Utils/backend";
import { useRevalidator } from 'react-router-dom'
import Loader from "../../Components/Loader";
import NftTile from "../../Components/NftTile/NftTile";
import CollectionTile from "../../Components/CollectionTile/CollectionTile";
import PageSelector from "../../Components/PageSelector/PageSelector";
import EditProfileModal from "./EditProfileModal";
import LinkButton from "../../Components/LinkButton";
import PlaceholdImg from "../../Components/PlaceholdImg";
import styles from './Profile.module.scss';
import SocialLinks from "../../Components/Socials";

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
                        <Col className={styles.nftsContainer}>
                            {userProfile.tokens.map(token=>{
                                return (
                                    <NftTile token={token} />
                                );
                            })}
                        </Col>
                    :
                        <Col className='card d-flex flex-columnm justify-content-center' style={{textAlign: 'center', padding: '32px 0'}}>
                            <div style={{margin: 'auto'}}>
                            { (userAddress === wallet?.address) ?
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
                        <Col className={styles.nftsContainer}>
                            {userProfile.collections.map(collection=>{
                                return (
                                    <CollectionTile fullCollection={collection} />
                                );
                            })}
                        </Col>
                    :
                        <Col className='card d-flex flex-columnm justify-content-center' style={{textAlign: 'center', padding: '32px 0'}}>
                            <div style={{margin: 'auto'}}>
                            {/* `userProfile.profile?.address` should never be undefined if the user has logged in */}
                            { (userProfile.profile?.address === wallet?.address) ?
                                <>
                                    <h2 className='mb16'>You haven't created any collections yet.</h2>
                                    <LinkButton to='/nfts/create'>
                                        Start Creating
                                    </LinkButton>
                                </>

                                :
                                <h2 className='mb16'>This user hasn't created any collections yet.</h2>
                            }
                            </div>

                        </Col>
                );
        }
    }

    const displayImage = userProfile.profile?.profile_image ? getApiUrl(`/public/${userProfile.profile.profile_image}`) : undefined;
    return (<>
                { !!userProfile.profile && 
                  <EditProfileModal open={editProfile} onClose={()=>setEditProfile(false)} userId={userProfile.profile?._id || ''} userProfile={userProfile.profile} />
                }
                <div className={styles.picRow}>
                    <Col xs={{span: 8, offset: 2}} md={{span: 3, offset: 0}} className='card square'>
                        <PlaceholdImg src={displayImage} alt={ userProfile.display_name } className='tall wide imgCover' />
                    </Col>
                    <Col
                        xs={12}
                        md={true}
                        className={`card ${styles.profileCard}`}
                        style={{
                            position: 'relative',
                            // ...bgStyle,
                        }}
                    >
                        <div className='d-flex flex-column genOverlay' style={{position: 'absolute', left: '16px', bottom: '16px', width: 'calc(100% - 32px)'}}>
                            <h1 className='oneLineLimit'>{userProfile.display_name}</h1>
                            <p>{userProfile.profile?.bio}</p>
                            <div className='d-flex wide justify-content-space-between'>
                                {/* <CollectionStats collection={collection} /> */}

                            </div>
                        </div>
                        <div style={{position: 'absolute', right: '16px', top: '16px'}}>
                            { (wallet && wallet.address === userProfile.profile?.address) &&
                                <Col>
                                    <button type="button" onClick={()=>setEditProfile(true)}>Edit</button>
                                </Col>
                            }
                        </div>
                        <div style={{position: 'absolute', right: '16px', bottom: '16px'}}>
                          <SocialLinks
                            color={'#666'}
                            discord={userProfile.profile?.discord}
                            twitter={userProfile.profile?.twitter}
                            telegram={userProfile.profile?.telegram} website={userProfile.profile?.website}
                          />
                        </div>

                    </Col>
                </div>
                <div className='d-flex flex-wrap' style={{gap: '8px', alignItems: 'stretch'}}>
                    <Col xs={12} md={3} className='card d-flex flex-column'>
                        <div style={{margin: '24px'}}>
                            <PageSelector pages={Pages} current={page} setPage={(newPage: any)=>setPage(newPage)} />
                        </div>
                    </Col>
                    {getPage(page)}
                </div>

    </>
    );
};

export default ProfilePage;