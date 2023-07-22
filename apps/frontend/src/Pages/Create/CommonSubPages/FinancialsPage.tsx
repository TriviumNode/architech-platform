import { calculateFee, CATEGORIES, denomToHuman, findDenom, humanToDenom } from "@architech/lib";
import { Denom } from "@architech/types";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { DenomImg } from "../../../Components/ArchDenom";
import MultiSelect from "../../../Components/MultiSelect";
import SelectMenu, { SelectOption } from "../../../Components/SelectMenu/SelectMenu";
import { useUser } from "../../../Contexts/UserContext";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'

const nativeDenom = findDenom(process.env.REACT_APP_NETWORK_DENOM);
const selectOptions: SelectOption[] = [
    {
        value: nativeDenom,
        content: (
            <div>
                <DenomImg denom={nativeDenom} /> {nativeDenom.displayDenom}
            </div>
        )

    }
]

export interface FinancialState {
    denom: Denom,
    amount: string,
    beneficiary_address: string;
    royalty_address: string;
    royalty_percent: string;
    list: boolean;
}

export const DefaultFinancialState: FinancialState = {
    denom: nativeDenom,
    amount: '',
    beneficiary_address: '',
    royalty_address: '',
    royalty_percent: '',
    list: false,
}

const FinancialPage: FC<{
    state: FinancialState,
    isCollection?: boolean,
    onChange: (data: FinancialState)=>void;
    next: ()=>void;
}> = ({state, isCollection, onChange, next}): ReactElement => {
    const {user} = useUser()
    const [selectedOption, setSelectedOption] = useState<SelectOption>(selectOptions[0])

    const handleSelect = (selected: SelectOption) => {
        setSelectedOption(selected);
        updateState({...state, denom: selected.value})
    }

    const updateState = (newState: Partial<FinancialState>) => {
        onChange({...state, ...newState})
    }

    const denomAmount = parseInt(humanToDenom(state.amount || 0, selectedOption.value.decimals));
    const feeAmountDenom = calculateFee(denomAmount, isCollection ? 0.03 : 0.025);
    const feeAmount = denomToHuman(feeAmountDenom, selectedOption.value.decimals)

    const total = parseFloat(state.amount || '0') - feeAmount

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
            <h2 className='mb32'>Financial<br />Details</h2>
                <button type='button' onClick={()=>next()}>Next</button>
            </div>
            <form className={styles.form}>
            { !!!isCollection &&<>
                <div className='d-flex mb24'>
                    <Col xs={8}>
                        <label>
                            Royalty Payment Wallet
                            <input value={state.royalty_address} onChange={e=>updateState({royalty_address: e.target.value})} placeholder='archway1a2b...' />
                        </label>
                        <div style={{textAlign: 'right', cursor: 'pointer'}} className={`${styles.spanButton} wide`} onClick={()=>updateState({royalty_address: user?.address || ''})}>Use my address</div>
                    </Col>
                    <Col xs={4}>
                        <label>
                            Royalty Percentage
                            <div className='d-flex flex-column wide'>
                                <input value={state.royalty_percent} onChange={e=>updateState({royalty_percent: e.target.value})} placeholder='5' /><span className={styles.percent}>%</span>
                            </div>
                        </label>
                    </Col>
                </div>
                <div className='d-flex align-items-center mb24 mt16'>
                    <Switch
                        checked={state.list}
                        onChange={(e: any)=>updateState({list: e.target.checked})}
                    />
                    <span className='ml16'>List NFT for sale on Architech.</span>
                </div>
            </>}
            { (!!isCollection || state.list) &&
            <>
                <div className='d-flex flex-wrap mt16 mb24'>
                    <Col xs={6}>
                        <label>
                            Sell {!!isCollection && 'each '} NFT for<br />
                            <SelectMenu options={selectOptions} title='Select a token' selected={selectedOption} select={(option)=>handleSelect(option)}  className='mt8'  />
                        </label>
                    </Col>
                    <Col xs={true}>
                        <label className='d-flex flex-column'>
                            Amount<br />
                            <input value={state.amount} onChange={(e)=>updateState({amount: e.target.value.replace(/[^0-9.]/gi, '')})} className='mt8'  />
                        </label>
                    </Col>
                </div>
                { !!isCollection &&
                    <div className='d-flex mb24'>
                        <Col>
                            <label>
                                Beneficiary Address
                                <div className='lightText10'>
                                    Address to receive the funds from minting
                                </div>
                                <input value={state.beneficiary_address} onChange={e=>updateState({beneficiary_address: e.target.value})} placeholder='archway1a2b...' />
                            </label>
                            <div style={{textAlign: 'right', cursor: 'pointer'}} className={`${styles.spanButton} wide`} onClick={()=>updateState({beneficiary_address: user?.address || ''})}>Use my address</div>
                        </Col>
                    </div>
                }
                <div className='d-flex flex-column gap8 mb16' style={{margin: '0px 16px'}}>
                    <h4 style={{color: '#000'}}>Fee Breakdown</h4>
                    
                    <div className='d-flex flex-column gap8' style={{margin: '0px 16px'}}>
                        <div className='d-flex justify-content-between'>
                            <span>Sale Fee&nbsp;<span className='lightText10'>({!!isCollection ? '3%' : '2.5%'})</span></span>
                            <span className="lightText12">{feeAmount.toFixed(3)}&nbsp;{selectedOption.value.displayDenom}<span className='lightText10'>{!!isCollection &&' / Mint'}</span></span>
                        </div>
                        <div className='d-flex justify-content-between'>
                            <span style={{fontWeight: '600'}}>You Get</span>
                            <span>{`${total.toFixed(3)} ${selectedOption.value.displayDenom}`}<span className='lightText10'>{!!isCollection &&' / Mint'}</span></span>
                        </div>
                    </div>
                </div>
            </>}
            </form>
        </div>
    )
}

export default FinancialPage;