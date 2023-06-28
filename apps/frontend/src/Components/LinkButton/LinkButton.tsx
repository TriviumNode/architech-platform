
import { CSSProperties, FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.scss';

const LinkButton: FC<{
    to: string,
    className?: string;
    children: any,
    style?: CSSProperties;
}> = ({to, children, className, style}): ReactElement => {
    return(
        <Link to={to} className={`${styles.linkButton} ${className}`} style={style}>
            <div className={`d-flex tall align-items-center`}>{children}</div>
        </Link>
    );
}
export default LinkButton;