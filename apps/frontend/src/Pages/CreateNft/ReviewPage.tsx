import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from './createNft.module.scss'

const ReviewNftPage: FC<{
    // onChange: (data: FinishState)=>void;
    onClick: (e: any)=>any;
}> = ({ onClick}): ReactElement => {
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Review<br />NFT</h2>
            <form className={styles.form}>
                <div className='d-flex flex-column mb24 align-items-center mt16'>
                    <Col xs='auto'>
                        <button type='button' onClick={onClick}>Create NFT</button>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default ReviewNftPage;