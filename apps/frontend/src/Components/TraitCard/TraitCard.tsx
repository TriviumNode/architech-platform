import { FC, ReactElement } from "react";
import styles from './TraitCard.module.scss';

const TraitCard: FC<{
    type: string;
    value: string;
}> = ({ type, value}): ReactElement => {
    return(
        <div className={`${styles.trait} grayCard`}>
            <span className={styles.type}>{type}</span>
            <hr />
            <span className={styles.value}>{value}</span>
        </div>
    )
}

export default TraitCard;