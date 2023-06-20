import { Collection } from "@architech/types"
import { FC, ReactElement } from "react"
import ArchDenom from "../ArchDenom";

import styles from './stats.module.scss';


interface Props {
    collection: Collection;
    forSale: number | string;
}

const CollectionStats: FC<Props> = ({collection, forSale}): ReactElement => {
    console.log('collection.totalTokens', collection.totalTokens)
    return (
        <div className='d-flex wide' style={{gap: '32px'}}>
            <div>
                <div className={styles.number}>{collection.totalTokens}</div>
                <span className={styles.label}>Items</span>
            </div>
            <div>
                <div className={styles.number}>{forSale}</div>
                <span className={styles.label}>Listed</span>
            </div>
            <div className={styles.vr} />
            <div>
                <div className={`${styles.number} d-flex align-items-center`}>1&nbsp;<ArchDenom /></div>
                <span className={styles.label}>Floor</span>
            </div>
            <div>
                <div className={`${styles.number} d-flex align-items-center`}>123.45&nbsp;<ArchDenom /></div>
                <span className={styles.label}>Total Volume</span>
            </div>
        </div>
    )
}

export default CollectionStats;