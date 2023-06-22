
import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.scss';

const LinkButton: FC<{
    to: string,
    children: any,
}> = ({to, children}): ReactElement => {
    return(
        <Link to={to} className={styles.linkButton}>
            <div className='d-flex tall align-items-center' style={{}}>{children}</div>
        </Link>
    );
}
export default LinkButton;