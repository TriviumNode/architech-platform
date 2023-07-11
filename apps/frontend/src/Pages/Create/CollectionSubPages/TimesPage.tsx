import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import DateTimePicker from "react-datetime-picker";
import MultiSelect from "../../../Components/MultiSelect";
import { useUser } from "../../../Contexts/UserContext";

import styles from '../create.module.scss'
import { CollectionType } from "../CreateCollection";

// import 'react-datetime-picker/dist/DateTimePicker.css';
// import 'react-calendar/dist/Calendar.css';
// import 'react-clock/dist/Clock.css';

export interface TimesState {
    launch_time: Date | undefined;

    // Random Mint Only
    whitelist_launch_time: Date | undefined,
    
    // Copy Mint only
    end_time: Date | undefined;
    mint_limit: string;
}

export const DefaultTimesState: TimesState = {
    launch_time: undefined,
    whitelist_launch_time: undefined,
    end_time: undefined,
    mint_limit: '',
}

const TimesPage: FC<{
    state: TimesState,
    collectionType: CollectionType;
    onChange: (data: TimesState)=>void;
    next: ()=>void;
}> = ({state, collectionType, onChange, next}): ReactElement => {
    const {user} = useUser()
    if (collectionType === 'STANDARD') throw new Error('Invalid collection type for this page.');

    const updateState = (newState: Partial<TimesState>) => {
        console.log(newState)
        onChange({...state, ...newState})
    }

    const handleChangeLaunchTime = (e: any) => {
        console.log(e.target.validity)
        if (!e.target.validity.valid) return;
        updateState({launch_time:  e.target.value});
    }
    const handleChangeWhitelistTime = (e: any) => {
        console.log(e.target.validity)
        if (!e.target.validity.valid) return;
        console.log('e.target', e.target)
        updateState({whitelist_launch_time: e.target.value});
    }
    const handleChangeEndTime = (e: any) => {
        console.log(e.target.validity)
        if (!e.target.validity.valid) return;
        updateState({end_time: e.target.value});
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
            <h2 className='mb32'>{collectionType === 'RANDOM' ? (<>Launch<br/>Time</>) :  (<>{`Times & Limits`}</>)}</h2>
                <button type='button' onClick={()=>next()}>Next</button>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Launch Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time allow minting for any address.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input disabled={true} defaultValue={state.launch_time?.valueOf()} onChange={handleChangeLaunchTime} type="datetime-local" />
                            {/* <DateTimePicker onChange={(data: any)=>console.log(data)} value={state.launch_time} /> */}
                        </label>
                    </Col>
                    { collectionType === 'RANDOM' ?
                    <Col>
                        <label>
                            Whitelist Launch Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time allow minting for whitelisted addresses. <span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input disabled={true} defaultValue={state.whitelist_launch_time?.valueOf()} onChange={handleChangeWhitelistTime} type="datetime-local" />
                        </label>
                    </Col>
                    :
                    <Col>
                        <label>
                            End Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time stop additional copies from being minted.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input disabled={true} defaultValue={state.end_time?.valueOf()} onChange={handleChangeEndTime} type="datetime-local" />
                        </label>
                    </Col>
                    }
                </div>
                { collectionType === 'COPY' &&
                <div className='d-flex mb24'>
                    <Col xs={4}>
                        <label>
                            Mint Limit
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Maximum number of copies that can be minted.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input
                                value={state.mint_limit}
                                onChange={(e)=>updateState({mint_limit: e.target.value.replace(/[^0-9]/gi, '')})}
                            />
                            {/* <DateTimePicker onChange={(data: any)=>console.log(data)} value={state.launch_time} /> */}
                        </label>
                    </Col>
                </div>
                }
            </form>
        </div>
    )
}

export default TimesPage;