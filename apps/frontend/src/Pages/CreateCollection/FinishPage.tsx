import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from './create.module.scss'

export interface FinishState {
    hidden: boolean,
}

export const DefaultFinishState: FinishState = {
    hidden: true,
}

const FinishPage: FC<{
    data: FinishState,
    onChange: (data: FinishState)=>void;
    onClick: (e: any)=>any;
}> = ({data, onChange, onClick}): ReactElement => {

    const updateState = (newState: Partial<FinishState>) => {
        onChange({...data, ...newState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Create<br />Collection</h2>
            <form className={styles.form}>
                <div className='d-flex flex-column mb24 align-items-center mt16'>
                    <Col xs='auto' style={{textAlign: 'center'}}>
                        <div className='d-flex align-items-center mb24'>
                            <Switch
                                checked={data.hidden}
                                onChange={(e: any)=>updateState({hidden: e.target.checked})}
                            />
                            <span className='ml16'>Hide collection from others until you are ready to reveal it.</span>
                        </div>
                    </Col>
                    <Col xs='auto'>
                        <button type='button' onClick={onClick}>Create Collection</button>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default FinishPage;