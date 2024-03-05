import { FC, ReactElement } from "react";
import styles from './TraitCard.module.scss';

const TraitCard: FC<{
    type: string;
    value: string;
}> = ({ type, value}): ReactElement => {
    return(
        <div className={`${styles.trait} grayCard`}>
            <span className={`${styles.type} twoLineLimit breakAll`}>{type}</span>
            <hr />
            <span className={`${styles.value} twoLineLimit breakAll`}>{value}</span>
        </div>
    )
}

export default TraitCard;