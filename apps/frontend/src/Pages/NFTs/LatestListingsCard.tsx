import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { getLatestListings } from "../../Utils/backend";
import { GetLatestListingsResponse } from '@architech/types'

import styles from './NFTs.module.scss'
import ListingRow from "../../Components/ListingRow/ListingRow";

const LatestListingsCard: FC<any> = (): ReactElement => {
    const { collections } = useLoaderData() as { collections: any[]};

    const [latest, setLatest] = useState<GetLatestListingsResponse[]>([]);

    console.log(collections);

    const GetLatest = async () => {
        try {
            const result = await getLatestListings();
            console.log(result)
            setLatest(result);
        } catch(err: any) {
            console.error('Error getting trending collections:', err)
        }
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
                { latest.map((t, k)=>
                    <div key={t.collection.address} className='wide'>
                        <ListingRow result={t} />
                        {k < 2 && <hr className='mt16' />}
                    </div>
                )}
            </div>
        </>
    );
};

export default LatestListingsCard;