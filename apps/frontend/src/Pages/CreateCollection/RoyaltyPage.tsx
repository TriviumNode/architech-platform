import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";

import styles from './create.module.scss'

export interface RoyaltyState {
    address: string,
    percent: string,
}

export const DefaultRoyaltyState: RoyaltyState = {
    address: '',
    percent: '',
}

const RoyaltyPage: FC<{
    data: RoyaltyState,
    onChange: (data: RoyaltyState)=>void;
}> = ({data, onChange}): ReactElement => {

    const updateDetailState = (newDetailState: Partial<RoyaltyState>) => {
        console.log(newDetailState)
        onChange({...data, ...newDetailState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Royalty<br />Details</h2>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col xs={8}>
                        <label>
                            Royalty Payment Wallet
                            <input placeholder='archway1a2b...' />
                        </label>
                    </Col>
                    <Col xs={4}>
                        <label>
                            Royalty Percentage
                            {/* <div className={styles.pInputContainer}> */}
                            <div className='d-flex flex-column wide'>
                                <input placeholder='5' /><span className={styles.percent}>%</span></div>
                            {/* </div> */}
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default RoyaltyPage;