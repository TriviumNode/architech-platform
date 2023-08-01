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

export function timestampToDatetimeInputString(timestamp: Date) {
    const date = new Date(timestamp.valueOf() + _getTimeZoneOffsetInMs());
    // slice(0, 19) includes seconds
    return date.toISOString().slice(0, 19);
}

function _getTimeZoneOffsetInMs() {
    return new Date().getTimezoneOffset() * -60 * 1000;
}

export interface TimesState {
    launch_time: Date | undefined;

    // Random Mint Only
    whitelist_launch_time: Date | undefined,
    
    // Copy Mint only
    end_time: Date | undefined;
    mint_limit: string;
    max_copies: string;
}

export const DefaultTimesState: TimesState = {
    launch_time: undefined,
    whitelist_launch_time: undefined,
    end_time: undefined,
    mint_limit: '1',
    max_copies: '',
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
        console.log(e.target)
        if (!e.target.validity.valid) return;

        const date = new Date(e.target.value)
        updateState({launch_time: date});
    }
    const handleChangeWhitelistTime = (e: any) => {
        if (!e.target.validity.valid) return;
        
        const date = new Date(e.target.value)
        updateState({whitelist_launch_time: date});
    }
    const handleChangeEndTime = (e: any) => {
        if (!e.target.validity.valid) return;

        const date = new Date(e.target.value)
        updateState({end_time: date});
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
                            <input
                                defaultValue={
                                    state.launch_time ?
                                        timestampToDatetimeInputString(state.launch_time)
                                    :
                                        undefined
                                }
                                onChange={handleChangeLaunchTime}
                                type="datetime-local"
                            />
                        </label>
                    </Col>
                    { collectionType === 'RANDOM' ?
                    <Col>
                        <label>
                            Whitelist Launch Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time allow minting for whitelisted addresses. <span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input
                                defaultValue={
                                    state.whitelist_launch_time ?
                                        timestampToDatetimeInputString(state.whitelist_launch_time)
                                    :
                                        undefined
                                }
                                onChange={handleChangeWhitelistTime}
                                type="datetime-local"
                            />
                        </label>
                    </Col>
                    :
                    <Col>
                        <label>
                            End Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time stop additional copies from being minted.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input
                                defaultValue={
                                    state.end_time ?
                                        timestampToDatetimeInputString(state.end_time)
                                    :
                                        undefined
                                }
                                onChange={handleChangeEndTime}
                                type="datetime-local"
                            />
                        </label>
                    </Col>
                    }
                </div>
                <div className='d-flex mb24'>
                    <Col xs={collectionType === 'COPY' ? 6 : 4}>
                        <label>
                            Mint Limit
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Number of copies each address can mint.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input
                                value={state.mint_limit}
                                onChange={(e)=>updateState({mint_limit: e.target.value.replace(/[^0-9]/gi, '')})}
                            />
                        </label>
                    </Col>
                    { collectionType === 'COPY' &&
                    <Col xs={6}>
                        <label>
                            Maximum Copies
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Total number of copies that can be minted.<br /><span style={{color: 'red'}}>This can't be changed after minting has started.</span>
                            </div>
                            <input
                                value={state.max_copies}
                                onChange={(e)=>updateState({max_copies: e.target.value.replace(/[^0-9]/gi, '')})}
                            />
                        </label>
                    </Col>
                }
                </div>

            </form>
        </div>
    )
}

export default TimesPage;