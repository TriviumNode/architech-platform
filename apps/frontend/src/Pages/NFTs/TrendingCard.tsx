import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { getTrendingCollections } from "../../Utils/backend";
import { GetTrendingCollectionResponse } from '@architech/types'

import styles from './NFTs.module.scss'
import TrendingRow from "../../Components/TrendingRow/TrendingRow";

const TrendingCard: FC<any> = (): ReactElement => {
    const { collections } = useLoaderData() as { collections: any[]};

    const [trending, setTrending] = useState<GetTrendingCollectionResponse>([]);

    console.log(collections);

    const getTrending = async () => {
        try {
            const result = await getTrendingCollections();
            console.log(result)
            setTrending(result);
        } catch(err: any) {
            console.error('Error getting trending collections:', err)
        }
    }
    
    useEffect(()=>{
        getTrending();
    },[])

    return (
        <>
            <div className={styles.listCard}>
                <h2 className='mb24'>Trending</h2>
                <div className='d-flex wide mb24 lightText12'>
                    <Col xs={8}>
                        <span>Project</span>
                    </Col>
                    <Col xs={2} style={{textAlign: 'center'}}>
                        <span>Floor</span>
                    </Col>
                    <Col xs={2} style={{textAlign: 'center'}}>
                        <span>Volume</span>
                    </Col>
                </div>
                { trending.map((t, k)=>
                    <div key={t.collection.address} className='wide'>
                        <TrendingRow result={t} />
                        {k < 2 && <hr className='mt16'  />}
                    </div>
                )}
            </div>
        </>
    );
};

export default TrendingCard;