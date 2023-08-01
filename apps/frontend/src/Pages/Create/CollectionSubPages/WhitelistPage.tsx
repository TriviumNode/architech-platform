import { calculateFee, CATEGORIES, denomToHuman, findDenom, humanToDenom } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'
import { Denom } from "@architech/types";
import SelectMenu, { SelectOption } from "../../../Components/SelectMenu/SelectMenu";
import { DenomImg } from "../../../Components/ArchDenom";

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

export interface WhitelistState {
    raw_addresses: string,
    whitelist_price: boolean,
    denom: Denom,
    amount: string,
}

export const DefaultWhitelistState: WhitelistState = {
    raw_addresses: '',
    whitelist_price: false,
    denom: nativeDenom,
    amount: '',
}

const WhitelistPage: FC<{
    state: WhitelistState,
    current?: WhitelistState,
    isEditing?: boolean,
    onChange: (detail: WhitelistState)=>void;
    next: ()=>void;
}> = ({state, current, isEditing, onChange, next}): ReactElement => {
    const [errors, setErrors] = useState<Partial<WhitelistState>>()
    const [selectedOption, setSelectedOption] = useState<SelectOption>(selectOptions[0])

    const handleSelect = (selected: SelectOption) => {
        setSelectedOption(selected);
        updateState({...state, denom: selected.value})
    }

    const updateState = (newDetailState: Partial<WhitelistState>) => {
        onChange({...state, ...newDetailState})
    }

    const handleNext = (e: any) => {
        e.preventDefault();
        next();
    }

    const denomAmount = parseInt(humanToDenom(state.amount || 0, selectedOption.value.decimals));
    const feeAmountDenom = calculateFee(denomAmount, 0.03);
    const feeAmount = denomToHuman(feeAmountDenom, selectedOption.value.decimals)

    const total = parseFloat(state.amount || '0') - feeAmount

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Collection<br />Details</h2>
                <button type='button' onClick={handleNext}>Next</button>
            </div>
            
            <form className={styles.form}>
                <div className='d-flex' style={{marginBottom: '32px'}}>
                    <Col>
                        <label>
                            Whitelisted Addresses
                            <div className='lightText10'>One address per line</div>
                            <textarea value={state.raw_addresses} onChange={(e)=>updateState({raw_addresses: e.target.value})} />
                        </label>
                    </Col>
                </div>

                <div className='d-flex align-items-center mb24 mt16'>
                    <Switch
                        checked={state.whitelist_price}
                        onChange={(e: any)=>updateState({whitelist_price: !state.whitelist_price})}
                    />
                    <span className='ml16'>Set a different price for whitelisted buyers</span>
                </div>

                

                { state.whitelist_price &&
                    <>
                        <div className='d-flex flex-wrap mt16 mb24'>
                            <Col xs={6}>
                                <label>
                                    Whitelisted buyers may purchase an NFT for<br />
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

                        <div className='d-flex flex-column gap8 mb16' style={{margin: '0px 16px'}}>
                            <h4 style={{color: '#000'}}>Fee Breakdown</h4>
                            
                            <div className='d-flex flex-column gap8' style={{margin: '0px 16px'}}>
                                <div className='d-flex justify-content-between'>
                                    <span>Sale Fee&nbsp;<span className='lightText10'>(3%)</span></span>
                                    <span className="lightText12">{feeAmount.toFixed(3)}&nbsp;{selectedOption.value.displayDenom}<span className='lightText10'> / Whitelist Mint</span></span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span style={{fontWeight: '600'}}>You Get</span>
                                    <span>{`${total.toFixed(3)} ${selectedOption.value.displayDenom}`}<span className='lightText10'> / Whitelist Mint</span></span>
                                </div>
                            </div>
                        </div>
                    </>}

            </form>
        </div>
    )
}

export default WhitelistPage;