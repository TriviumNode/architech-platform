import { findDenom, humanToDenom, listToken } from "@architech/lib";
import { Denom, Token } from "@architech/types";
import { useState, ChangeEvent, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";
import { useUser } from "../../Contexts/UserContext";
import { ImportCollectionData } from "../../Interfaces/interfaces";
import { editCollection, importCollection, updateCollectionImage } from "../../Utils/backend";
import { MARKETPLACE_ADDRESS } from "../../Utils/queryClient";
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
    const { user } = useUser()

    const [selectedOption, setSelectedOption] = useState<SelectOption>(selectOptions[0])
    const [formState, setFormState] = useState<State>(defaultState);
    const [loading, setLoading] = useState(false);

    const handleSelect = (selected: SelectOption) => {
        setSelectedOption(selected);
        setFormState({...formState, denom: selected.value})
    }

    const updateAmount = (e: any) => {
        setFormState({...formState, amount: e.target.value})
    }

    const handleList = async(e: any) => {
        e.preventDefault();
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
            onList();
            onClose();
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || err.response?.msg || err.toString())
        }
    }


    return(
        <Modal open={open} onClose={onClose} style={{width: '50%'}}>
            <form onSubmit={handleList}>
            <Row>
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
            <Row style={{marginTop: '20px', justifyContent: 'flex-end'}}>
                <Col xs="auto">
                    <button type="submit" disabled={loading}>List for sale{loading && <SmallLoader /> }</button>
                </Col>
            </Row>
            </form>
        </Modal>
    )
}