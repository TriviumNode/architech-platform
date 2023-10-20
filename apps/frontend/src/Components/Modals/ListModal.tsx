import { calculateFee, denomToHuman, findDenom, getRoyalty, humanToDenom, listToken, trimNonNumeric } from "@architech/lib";
import { Denom, Token } from "@architech/types";
import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";
import { useUser } from "../../Contexts/UserContext";
import { ImportCollectionData } from "../../Interfaces/interfaces";
import { editCollection, importCollection, updateCollectionImage } from "../../Utils/backend";
import { MARKETPLACE_ADDRESS, QueryClient } from "../../Utils/queryClient";
import { DenomImg } from "../ArchDenom";
import SelectMenu, { SelectOption } from "../SelectMenu/SelectMenu";
import SmallLoader from "../SmallLoader";

interface Props {
    open: boolean;
    onClose: () => any;
    onList: () => any;
    token: Token;
}

interface State {
    denom: Denom,
    amount: string,
}


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

const defaultState: State = {
    denom: nativeDenom,
    amount: '',
}


export default function ListModal({open, token, onClose, onList}: Props) {
    const { user, refreshProfile } = useUser()

    const [selectedOption, setSelectedOption] = useState<SelectOption>(selectOptions[0])
    const [formState, setFormState] = useState<State>(defaultState);
    const [loading, setLoading] = useState(false);
    const [royaltyRate, setRoyaltyRate] = useState<number>(0)
    const [loadingRoyalty, setLoadingRoyalty] = useState(false)

    const handleSelect = (selected: SelectOption) => {
      setSelectedOption(selected);
      setFormState({...formState, denom: selected.value})
    }

    const updateAmount = (e: any) => {
      setFormState({...formState, amount: trimNonNumeric(e.target.value)})
    }

    const queryRoyalty = async () => {
        setLoadingRoyalty(true);
        try {
            const {royalty_amount} = await getRoyalty({client: QueryClient, contract: token.collectionAddress, token_id: token.tokenId, sale_price: '1000'})
            const rate = parseInt(royalty_amount) / 1000;
            console.log('rate', rate)
            setRoyaltyRate(rate);
        } catch (err: any) {
            setRoyaltyRate(0);
        }
        setLoadingRoyalty(false);
    }

    useEffect(()=>{
        queryRoyalty()
    },[]);

    const handleList = async(e: any) => {
        e.preventDefault();
        setLoading(true);
        if (!user) throw new Error('Wallet is not connected.')
        const denomAmount = humanToDenom(formState.amount, formState.denom?.decimals)
        try {
            const response = await listToken({
                client: user.client,
                signer: user.address,
                amount: denomAmount,
                token_id: token.tokenId,
                cw721_contract: token.collectionAddress,  
                marketplace_contract: MARKETPLACE_ADDRESS,              
            });
            console.log('TX Result', response)
            refreshProfile();
            onList();
            onClose();
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || err.response?.msg || err.toString())
        }
        setLoading(false);
    }

    const denomAmount = parseInt(humanToDenom(formState.amount || 0, selectedOption.value.decimals));

    const feeAmountDenom = calculateFee(denomAmount, 0.025); //denomAmount * 0.025
    const feeAmount = denomToHuman(feeAmountDenom, selectedOption.value.decimals)

    const royaltyAmountDenom = calculateFee(denomAmount, royaltyRate); //denomAmount * royaltyRate
    const royaltyAmount = denomToHuman(royaltyAmountDenom, selectedOption.value.decimals)

    const total = parseFloat(formState.amount || '0') - royaltyAmount - feeAmount
    return(
        <Modal open={open} onClose={onClose} style={{width: '40%'}}>
            <form onSubmit={handleList}>
            <Row className='mb16'>
                <Col xs={6}>
                    <label>
                        Sell for<br />
                        <SelectMenu options={selectOptions} title='Select a token' selected={selectedOption} select={(option)=>handleSelect(option)}  className='mt8'  />
                    </label>
                </Col>
                <Col xs={6}>
                    <label className='d-flex flex-column'>
                        Amount<br />
                        <input value={formState.amount} onChange={updateAmount} className='mt8'  />
                    </label>
                </Col>
            </Row>

            <div className='d-flex flex-column gap8 mb16' style={{margin: '0px 16px'}}>
                <h4>Fee Breakdown</h4>
                
                <div className='d-flex flex-column gap8' style={{margin: '0px 16px'}}>
                    <div className='d-flex justify-content-between'>
                        <span>Sale Fee&nbsp;<span className='lightText10'>(2.5%)</span></span>
                        <span className="lightText12">{feeAmount.toLocaleString(undefined, {maximumFractionDigits: selectedOption.value.decimals})}&nbsp;{selectedOption.value.displayDenom}</span>
                    </div>
                    <div className='d-flex justify-content-between mb8'>
                        <span>Royalty&nbsp;<span className='lightText10'>({(royaltyRate*100).toLocaleString(undefined, {maximumFractionDigits: selectedOption.value.decimals})}%)</span></span>
                        <span className="lightText12">{loadingRoyalty ? <SmallLoader /> : `${royaltyAmount} ${selectedOption.value.displayDenom}`}</span>
                    </div>
                    <div className='d-flex justify-content-between'>
                        <span style={{fontWeight: '600'}}>You Get</span>
                        <span>{loadingRoyalty ? <SmallLoader /> : `${total.toLocaleString(undefined, {maximumFractionDigits: selectedOption.value.decimals})} ${selectedOption.value.displayDenom}`}</span>
                    </div>
                </div>
            </div>
            <Row style={{marginTop: '20px', justifyContent: 'flex-end'}}>
                <Col xs="auto">
                    <button type="submit" disabled={loading}>List for sale{loading && <SmallLoader /> }</button>
                </Col>
            </Row>
            </form>
        </Modal>
    )
}