import { FC, ReactElement, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";

import styles from './create.module.scss'

import astyles from './admin.module.scss'
import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../../Components/SmallLoader";
import { CREDIT_ADDRESS, MARKETPLACE_ADDRESS, NFT_FACTORY_ADDRESS, QueryClient } from "../../Utils/queryClient";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import Loader from "../../Components/Loader";
import { Contract } from "@cosmjs/cosmwasm-stargate";
import { GetCollectionResponse } from "@architech/types";
import { getCollection } from "../../Utils/backend";
import { getCollectionName } from "../../Utils/helpers";
import { Link } from "react-router-dom";

type CInfo = {
    metadata: ContractMetadata | undefined,
    info: Contract
}

type LookupResult = {
    contractInfo: CInfo;
    collection: GetCollectionResponse | undefined;
    minterInfo: CInfo | undefined;
}

type ArchitechContractRewards = {
    credits: CInfo,
    marketplace: CInfo,
    factory: CInfo,
}

const AdminRewardsPage: FC<{}> = (): ReactElement => {
    const { user } = useUser()
    const [contractAddress, setContractAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [rewards, setRewards] = useState<ArchitechContractRewards>();
    const [lookupResult, setLookupResult] = useState<LookupResult>();

    const handleLookup = async (e: any) => {
        e.preventDefault();

        setLoading(true);
        try {
            const metadata = await (async function() {
                try {
                return await QueryClient.getContractMetadata(contractAddress);
                } catch { return undefined }
            })();
            const info = await QueryClient.getContract(contractAddress);
            const collection = await (async function() {
                try {
                return await getCollection(contractAddress)
                } catch { return undefined }
            })();

            let minterInfo = undefined
            if (collection?.collection?.collectionMinter) {
                minterInfo = {
                    metadata: await (async function() {
                        try {
                        return await QueryClient.getContractMetadata(collection.collection.collectionMinter?.minter_address as string);
                        } catch { return undefined }
                    })(),
                    info: await QueryClient.getContract(collection.collection.collectionMinter.minter_address),
                }
            }

            const lResult: LookupResult = {
                contractInfo: {metadata, info},
                collection: collection,
                minterInfo,
            }
            setLookupResult(lResult)
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
        setLoading(false);
    }

    const handleGetMetadata = async () => {
        try {
            const credits_metadata = await (async function() {
                try {
                return await QueryClient.getContractMetadata(CREDIT_ADDRESS);
                } catch { return undefined }
            })();
            const marketplace_metadata = await (async function() {
                try {
                return await QueryClient.getContractMetadata(MARKETPLACE_ADDRESS);
                } catch { return undefined }
            })();
            const factory_metadata = await (async function() {
                try {
                return await QueryClient.getContractMetadata(NFT_FACTORY_ADDRESS);
                } catch { return undefined }
            })();
            const credits_info = await QueryClient.getContract(CREDIT_ADDRESS);
            const marketplace_info = await QueryClient.getContract(MARKETPLACE_ADDRESS);
            const factory_info = await QueryClient.getContract(NFT_FACTORY_ADDRESS);
            const r: ArchitechContractRewards = {
                credits: {
                    metadata: credits_metadata,
                    info: credits_info,
                },
                marketplace: {
                    metadata: marketplace_metadata,
                    info: marketplace_info,
                },
                factory: {
                    metadata: factory_metadata,
                    info: factory_info,
                },
            }
            console.log(r);
            setRewards(r)
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
    }

    useEffect(()=>{
        handleGetMetadata()
    },[])


    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Contract<br />Metadata</h2>
            </div>

            <h4>Architech Contracts</h4>
            <div className={astyles.rewardsRow}>
                { !rewards ? 
                    <Col>
                        <Loader />
                    </Col>
                :<>
                <Col xs={6}>
                    <h5>Credit Manager</h5>
                    <div className='lightText10' style={{marginLeft: '4px'}}>{CREDIT_ADDRESS}</div>
                    <> 
                        <p><span>Admin</span><br/>{rewards.credits.info.admin}</p>
                        <p><span>Owner</span><br/>{rewards.credits.metadata?.ownerAddress || 'Not Configured'}</p>
                        <p><span>Reward Recipient</span><br/>{rewards.credits.metadata?.rewardsAddress || 'Not Configured'}</p>
                    </>
                </Col>
                <Col xs={6}>
                    <h5>Marketplace</h5>
                    <div className='lightText10' style={{marginLeft: '4px'}}>{MARKETPLACE_ADDRESS}</div>
                    {
                        !rewards.marketplace ?
                            <p>Not Configured</p>
                        :
                        <>
                            <p><span>Admin</span><br/>{rewards.marketplace.info.admin}</p>
                            <p><span>Owner</span><br/>{rewards.marketplace.metadata?.ownerAddress || 'Not Configured'}</p>
                            <p><span>Reward Recipient</span><br/>{rewards.marketplace.metadata?.rewardsAddress || 'Not Configured'}</p>
                        </>
                    }
                </Col>
                <Col xs={6}>
                    <h5>NFT Factory</h5>
                    <div className='lightText10' style={{marginLeft: '4px'}}>{NFT_FACTORY_ADDRESS}</div>
                    {
                        !rewards.factory ?
                            <p>Not Configured</p>
                        :
                        <>
                            <p><span>Admin</span><br/>{rewards.factory.info.admin}</p>
                            <p><span>Owner</span><br/>{rewards.factory.metadata?.ownerAddress || 'Not Configured'}</p>
                            <p><span>Reward Recipient</span><br/>{rewards.factory.metadata?.rewardsAddress || 'Not Configured'}</p>
                        </>
                    }
                </Col>
                </>}
            </div>
            
            <h4>Lookup Metadata</h4>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            <p>Enter any contract address.</p>
                            <input value={contractAddress} onChange={(e)=>setContractAddress(e.target.value)} />
                        </label>
                    </Col>
                </div>
            </form>
            <div className='d-flex gap8 justify-content-center'>
                <button type='button' disabled={loading} onClick={handleLookup}>Lookup{loading && <>&nbsp;<SmallLoader /></>}</button>
            </div>
            <div className={astyles.rewardsRow}>
                { loading && 
                    <Col>
                        <Loader />
                    </Col>
                }
                { !!lookupResult &&
                    <Col xs={6}>
                        <h5>Contract</h5>
                        { !!lookupResult.collection && <p><span>Collection</span><br/><Link to={`/nfts/${lookupResult.collection.collection.address}`}>{getCollectionName(lookupResult.collection.collection)}</Link></p> }
                        <p><span>Admin</span><br/>{lookupResult.contractInfo.info.admin}</p>
                        <p><span>Owner</span><br/>{lookupResult.contractInfo.metadata?.ownerAddress || 'Not Configured'}</p>
                        <p><span>Reward Recipient</span><br/>{lookupResult.contractInfo.metadata?.rewardsAddress || 'Not Configured'}</p>
                    </Col>
                }
                { !!lookupResult?.minterInfo &&
                    <Col xs={6}>
                        <h5>Minter</h5>
                        <p><span>Admin</span><br/>{lookupResult.minterInfo.info.admin}</p>
                        <p><span>Owner</span><br/>{lookupResult.minterInfo.metadata?.ownerAddress || 'Not Configured'}</p>
                        <p><span>Reward Recipient</span><br/>{lookupResult.minterInfo.metadata?.rewardsAddress || 'Not Configured'}</p>
                    </Col>
                }
            </div>
        </div>
    )
}

export default AdminRewardsPage;