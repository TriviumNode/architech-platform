import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import DateTimePicker from "react-datetime-picker";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import MultiSelect from "../../../Components/MultiSelect";
import { useUser } from "../../../Contexts/UserContext";

import styles from '../create.module.scss'
import { CollectionType } from "../CreateCollection";

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.valueOf());
}

export function timestampToDatetimeInputString(timestamp: Date) {
    const date = new Date(timestamp.valueOf() + _getTimeZoneOffsetInMs());
    // slice(0, 19) includes seconds
    return date.toISOString().slice(0, 19);
}

const getDefaultValue = (input?: Date) => {
  if (input && isValidDate(input))
    return timestampToDatetimeInputString(input);
  else
    return undefined;
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

    const [errors, setErrors] = useState<any>({});

    useEffect(()=>{
      if (!state.whitelist_launch_time || !state.launch_time) return;
      if (state.whitelist_launch_time.valueOf() > state.launch_time.valueOf()) {
        setErrors({
          ...errors,
          whitelist_launch_time: `Whitelist launch time can't be after public launch time.`
        })
        return;
      } else {
        const newErrors = Object.fromEntries(Object.entries(errors).filter(([key]) => key.includes('whitelist_launch_time')));
        setErrors(newErrors);
      }
    },[state.whitelist_launch_time])

    const updateState = (newState: Partial<TimesState>) => {
        onChange({...state, ...newState})
    }

    const handleChangeLaunchTime = (e: any) => {
        if (!e.target.validity.valid) return;

        if (e.target.value) {
          const date = new Date(e.target.value)
          updateState({launch_time: date});
        } else {
          updateState({launch_time: undefined});
        }
    }

    const handleChangeWhitelistTime = (e: any) => {
        if (!e.target.validity.valid) return;
        if (!state.launch_time) {
          toast.error('Set a public launch time first first.')
          return;
        }

        if (e.target.value) {
          const date = new Date(e.target.value)
          updateState({whitelist_launch_time: date});
        } else {
          updateState({whitelist_launch_time: undefined});
        }

    }
    const handleChangeEndTime = (e: any) => {
        if (!e.target.validity.valid) return;

        if (e.target.value) {
          const date = new Date(e.target.value)
          updateState({end_time: date});
        } else {
          updateState({end_time: undefined});
        }
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
            <h2 className='mb32'>{collectionType === 'RANDOM' ? (<>Launch<br/>Time</>) :  (<>{`Times & Limits`}</>)}</h2>
                <button type='button' onClick={()=>next()}>Next</button>
            </div>
            <div>
              <p>
                Set lauch times and mint limits for this collection.<br/>
                <span style={{color: 'red', fontSize: '12px'}}>These settings can't be changed after minting has started.</span>
              </p>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Launch Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time allow minting for any address.
                            </div>
                            <input
                                defaultValue={getDefaultValue(state.launch_time)}
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
                                Time allow minting for whitelisted addresses.
                            </div>
                            <input
                                defaultValue={getDefaultValue(state.whitelist_launch_time)}
                                // defaultValue={
                                //     state.whitelist_launch_time ?
                                //         timestampToDatetimeInputString(state.whitelist_launch_time)
                                //     :
                                //         undefined
                                // }
                                onChange={handleChangeWhitelistTime}
                                type="datetime-local"
                                className={errors.whitelist_launch_time ? 'error' : undefined}
                                disabled={!state.launch_time}
                                data-tooltip-id="disabled-tooltip"
                                data-tooltip-content="Choose a launch time first."
                                data-tooltip-place="top"
                              />
                              { !!!state.launch_time &&
                                <Tooltip id="disabled-tooltip" />
                              }
                              { !!errors.whitelist_launch_time &&
                                <div style={{color: 'red', fontSize: '12px', margin: '2px 0 0 8px'}}>
                                  {errors.whitelist_launch_time}
                                </div>
                              }
                        </label>
                    </Col>
                    :
                    <Col>
                        <label>
                            End Time
                            <div className='lightText10' style={{margin: '4px 8px 0 8px', lineHeight: '100%'}}>
                                Time stop additional copies from being minted.
                            </div>
                            <input
                                defaultValue={getDefaultValue(state.end_time)}
                                // defaultValue={
                                //     state.end_time ?
                                //         timestampToDatetimeInputString(state.end_time)
                                //     :
                                //         undefined
                                // }
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
                                Number of copies each address can mint.
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
                                Total number of copies that can be minted.
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