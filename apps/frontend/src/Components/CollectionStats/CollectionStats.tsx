import { denomToHuman, getVolume, MARKETPLACE_ADDRESS } from "@architech/lib";
import { Collection, marketplace } from "@architech/types"
import { FC, ReactElement, useEffect, useState } from "react"
import { useUser } from "../../Contexts/UserContext";
import { QueryClient } from "../../Utils/queryClient";
import ArchDenom from "../ArchDenom";
import SmallLoader from "../SmallLoader";

import styles from './stats.module.scss';


interface Props {
    collection: Collection;
    asks: marketplace.Ask[];
}

const CollectionStats: FC<Props> = ({collection, asks}): ReactElement => {
    const [volume, setVolume] = useState<number>();

    const floor: string = asks &&
        asks.length ?
            asks.filter(a=>a.cw20_contract === undefined || a.cw20_contract === null)
                .sort((a, b)=>parseInt(a.price) - parseInt(b.price))[0].price : '0'
    const floorAmount = denomToHuman(floor, parseInt(process.env.REACT_APP_NETWORK_DECIMALS));

    const queryVolume = async() => {
        const volumeResult = await getVolume({
            client: QueryClient,
            contract: MARKETPLACE_ADDRESS,
            collection: collection.address
        })
        const amount = volumeResult.find(v=>v.denom === process.env.REACT_APP_NETWORK_DENOM)?.amount || '0';
        const humanAmount = denomToHuman(amount, parseInt(process.env.REACT_APP_NETWORK_DECIMALS))
        setVolume(humanAmount);
    }

    useEffect(()=>{
        if (!collection || !QueryClient) return;
        queryVolume()
    },[collection, QueryClient])

    return (
        <div className='d-flex wide' style={{gap: '32px'}}>
            <div>
                <div className={styles.number}>{collection.totalTokens}</div>
                <span className={styles.label}>Items</span>
            </div>
            <div>
                <div className={styles.number}>{asks?.length === undefined ? <SmallLoader /> : asks.length}</div>
                <span className={styles.label}>Listed</span>
            </div>
            <div className={styles.vr} />
            <div>
                <div className={`${styles.number} d-flex align-items-center`}>{floorAmount}&nbsp;<ArchDenom /></div>
                <span className={styles.label}>Floor</span>
            </div>
            <div>
                <div className={`${styles.number} d-flex align-items-center`}>{volume === undefined ? <SmallLoader /> : volume}&nbsp;<ArchDenom /></div>
                <span className={styles.label}>Total Volume</span>
            </div>
        </div>
    )
}

export default CollectionStats;