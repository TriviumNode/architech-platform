import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'
import { CollectionType } from "../CreateCollection";
import { DetailState } from "./CollectionDetailPage";
import { FinancialState } from "../CommonSubPages/FinancialsPage";
import { TimesState } from "./TimesPage";

export interface FinishState {
    hidden: boolean,
}

export const DefaultFinishState: FinishState = {
    hidden: true,
}

type FinishType = 'Create' | 'Import' | 'Deploy'
const FinishPage: FC<{
    collectionType?: CollectionType,
    finishType: FinishType,
    data: FinishState,
    details: DetailState,
    financials?: FinancialState,
    times?: TimesState,
    onChange: (data: FinishState)=>void;
    onClick: (e: any)=>any;
}> = ({collectionType, finishType, data, times, details, financials, onChange, onClick}): ReactElement => {

    const updateState = (newState: Partial<FinishState>) => {
        onChange({...data, ...newState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>{finishType}<br />Collection</h2>
            <form className={styles.form}>
                <div className='d-flex flex-column mb24 align-items-center mt16'>
                    <div className={styles.reviewBox}>
                        <p>
                            Review your collection and minter settings below. if everything looks good, click the button to deploy your collection and minter. Afterwards, you'll be able to load items into the minter. 
                        </p>

                        <div className='d-flex flex-wrap wide'>
                            <Col xs={6}>
                                <h4>Collection Name</h4>
                                <div className='lightText12'>{details.name}</div>
                            </Col>
                            <Col>
                                <h4>Collection Symbol</h4>
                                <div className='lightText12'>{details.name}</div>
                            </Col>
                        </div>

                        { (collectionType === 'RANDOM' || collectionType === 'COPY') &&
                            <div className='d-flex flex-wrap wide'>
                                <Col xs={6}>
                                    <h4>Mint Price</h4>
                                    <div className='lightText12'>{financials?.amount} {financials?.denom.displayDenom}</div>
                                </Col>
                                <Col>
                                    <h4>Beneficiary</h4>
                                    <div className='lightText12'>{financials?.beneficiary_address}</div>
                                </Col>
                            </div>
                        }

                        { (collectionType === 'RANDOM' || collectionType === 'COPY') &&
                            <div className={`d-flex flex-wrap wide`}>
                                <Col xs={6}>
                                    <h4>Launch Time</h4>
                                    <div className='lightText12'>{new Date(times?.launch_time || '').toLocaleTimeString()}</div>
                                </Col>
                                { collectionType === 'RANDOM' ?
                                    <>
                                        <Col>
                                            <h4>Whitelist Launch Time</h4>
                                            <div className='lightText12'>{new Date(times?.whitelist_launch_time || '').toLocaleTimeString()}</div>
                                        </Col>
                                        <Col>
                                            <h4>Whitelist</h4>
                                            <div className='lightText12'>{0} addresses whitelisted</div>
                                        </Col>
                                    </>
                                :
                                    <>
                                        <Col>
                                            <h4>End Time</h4>
                                            <div className='lightText12'>{new Date(times?.end_time || '').toLocaleTimeString()}</div>
                                        </Col>
                                        <Col>
                                            <h4>Mint Limit</h4>
                                            <div className='lightText12'>{times?.mint_limit || 'Infinite'}</div>
                                        </Col>
                                    </>
                                }
                            </div>
                        }
                    </div>
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
                        <button type='button' onClick={onClick}>{finishType} Collection</button>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default FinishPage;