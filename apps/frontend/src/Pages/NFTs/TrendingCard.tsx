import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { getTrendingCollections } from "../../Utils/backend";
import { GetTrendingCollectionResponse } from '@architech/types'

import styles from './NFTs.module.scss'
import TrendingRow from "../../Components/TrendingRow/TrendingRow";
import Loader from "../../Components/Loader";

const TrendingCard: FC<any> = (): ReactElement => {
    const [trending, setTrending] = useState<GetTrendingCollectionResponse>([]);
    const [loading, setLoading] = useState(true);

    const getTrending = async () => {
        setLoading(true);
        try {
            const result = await getTrendingCollections();
            setTrending(result);
        } catch(err: any) {
            console.error('Error getting trending collections:', err.toString(), err)
        }        
        setLoading(false);
    }
    
    useEffect(()=>{
        getTrending();
    },[])

    return (
        <>
            <div className={`${styles.listCard}`} >
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
                { loading ? 
                    <div className='wide d-flex justify-content-center'>
                        <Loader />
                    </div>
                : !trending || !trending.length ? 
                    <div className='wide d-flex justify-content-center' style={{flexGrow: 1}}>
                        <h3>No Collections Found</h3>
                    </div>
                : trending.slice(0,3).map((t, k)=>
                    <div key={t.collection.address} className='wide'>
                        <TrendingRow result={t} />
                        {k < 2 && <hr className='mt16'  />}
                    </div>
                )}
                {  }
            </div>
        </>
    );
};

export default TrendingCard;