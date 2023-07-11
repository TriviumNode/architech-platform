import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'

export interface WhitelistState {
    raw_addresses: string,
}

export const DefaultWhitelistState: WhitelistState = {
    raw_addresses: '',
}

const WhitelistPage: FC<{
    state: WhitelistState,
    current?: WhitelistState,
    isEditing?: boolean,
    onChange: (detail: WhitelistState)=>void;
    next: ()=>void;
}> = ({state, current, isEditing, onChange, next}): ReactElement => {
    const [errors, setErrors] = useState<Partial<WhitelistState>>()

    const updateDetailState = (newDetailState: Partial<WhitelistState>) => {
        onChange({...state, ...newDetailState})
    }

    const handleNext = (e: any) => {
        e.preventDefault();
        next();
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Collection<br />Details</h2>
                <button type='button' onClick={handleNext}>Next</button>
            </div>
            
            <form className={styles.form}>
                <div className='d-flex'>
                    <Col>
                        <label>
                            Whitelisted Addresses
                            <div className='lightText10'>One address per line</div>
                            <textarea value={state.raw_addresses} onChange={(e)=>updateDetailState({raw_addresses: e.target.value})} />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default WhitelistPage;