import {ReactElement, FC, useState, useEffect} from "react";
import { Row, Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { getTrendingCollections } from "../../Utils/backend";
import { QueryClient } from "../../Utils/queryClient";
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
                <h2>Trending</h2>
                <Row style={{width: '100%', marginBottom: '24px'}}>
                    <Col xs={8}>
                        <span>Project</span>
                    </Col>
                    <Col xs={2}>
                        <span>Floor</span>
                    </Col>
                    <Col xs={2}>
                        <span>Volume</span>
                    </Col>
                </Row>
                { trending.map(t=><>
                    <TrendingRow result={t} key={t.collection._id} />
                    <hr />
                </>)}
            </div>
        </>
    );
};

export default TrendingCard;