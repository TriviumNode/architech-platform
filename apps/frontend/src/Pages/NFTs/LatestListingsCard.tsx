import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { getLatestListings } from "../../Utils/backend";
import { GetLatestListingsResponse } from '@architech/types'

import styles from './NFTs.module.scss'
import ListingRow from "../../Components/ListingRow/ListingRow";
import Loader from "../../Components/Loader";

const LatestListingsCard: FC<any> = (): ReactElement => {
    const [latest, setLatest] = useState<GetLatestListingsResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const GetLatest = async () => {
        setLoading(true);
        try {
            const result = await getLatestListings();
            setLatest(result);
        } catch(err: any) {
            console.error('Error getting latest listings:', err.toString(), err)
        }
        setLoading(false);
    }
    
    useEffect(()=>{
        GetLatest();
    },[])

    return (
        <>
            <div className={styles.listCard}>
                <h2 className='mb24'>Latest Listings</h2>
                <div className='d-flex wide mb24 lightText12'>
                    <Col>
                        <span>NFT</span>
                    </Col>
                    <Col xs={2} style={{textAlign: 'right'}}>
                        <span>Price</span>
                    </Col>
                </div>
                { loading ? 
                    <div className='wide d-flex justify-content-center'>
                        <Loader />
                    </div>
                : !latest || !latest.length ? 
                    <div className='wide d-flex justify-content-center' style={{flexGrow: 1}}>
                        <h3>No Listings Found</h3>
                    </div>
                : latest.slice(0,3).map((t, k)=>
                    <div key={`${t.collection.address}-${t.ask.token_id}`} className='wide'>
                        <ListingRow result={t} />
                        {k < 2 && <hr className='mt16' />}
                    </div>
                )}
            </div>
        </>
    );
};

export default LatestListingsCard;