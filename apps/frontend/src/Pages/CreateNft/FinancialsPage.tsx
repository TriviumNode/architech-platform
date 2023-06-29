import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";
import { useUser } from "../../Contexts/UserContext";

import styles from './createNft.module.scss'

export interface FinancialState {
    address: string,
    percent: string,
}

export const DefaultFinancialState: FinancialState = {
    address: '',
    percent: '',
}

const FinancialPage: FC<{
    state: FinancialState,
    onChange: (data: FinancialState)=>void;
    next: ()=>void;
}> = ({state, onChange, next}): ReactElement => {
    const {user} = useUser()

    const updateState = (newState: Partial<FinancialState>) => {
        onChange({...state, ...newState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
            <h2 className='mb32'>Financial<br />Details</h2>
                <button type='button' onClick={()=>next()}>Next</button>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col xs={8}>
                        <label>
                            Royalty Payment Wallet
                            <input value={state.address} onChange={e=>updateState({address: e.target.value})} placeholder='archway1a2b...' />
                        </label>
                        <div style={{textAlign: 'right', cursor: 'pointer'}} className={`${styles.spanButton} wide`} onClick={()=>updateState({address: user?.address || ''})}>Use my address</div>
                    </Col>
                    <Col xs={4}>
                        <label>
                            Royalty Percentage
                            <div className='d-flex flex-column wide'>
                                <input value={state.percent} onChange={e=>updateState({percent: e.target.value})} placeholder='5' /><span className={styles.percent}>%</span>
                            </div>
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default FinancialPage;