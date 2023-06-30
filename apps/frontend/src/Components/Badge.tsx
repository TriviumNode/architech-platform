import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";

import styles from './badge.module.scss'

interface Props {
    background?: string;
    children: any;
    className?: string;
}
const Badge: FC<Props> = ({children, background = '#F2EFED', className}): ReactElement => {
    return (
        <div
            style={{ backgroundColor: background, borderRadius: '24px', height: '24px', width: 'auto', padding: '2px 12px' }}
            className={`d-flex align-items-center ${styles.text} ${className}`}
        >
            {children}
        </div>
    )
};

export default Badge;