import { getMetadata, getRewards } from "@architech/lib";
import { ContractMetadata } from "@archwayhq/arch3.js/build";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";
import SmallLoader from "../../Components/SmallLoader";
import { useUser } from "../../Contexts/UserContext";
import { QueryClient } from "../../Utils/queryClient";

import styles from './create.module.scss'

export interface RewardsState {
    address: string,
}

export const DefaultRewardsState: RewardsState = {
    address: '',
}

const RewardsPage: FC<{
    state: RewardsState,
    onChange: (data: RewardsState)=>void;
    contractAddress: string;
    metadata: ContractMetadata | undefined;
    loadingMetadata: boolean;
    loadingMetadataError: string | undefined;
    // next: ()=>void;
}> = ({state, contractAddress, onChange, metadata, loadingMetadata, loadingMetadataError}): ReactElement => {
    const {user} = useUser()

    const updateState = (newState: Partial<RewardsState>) => {
        onChange({...state, ...newState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
                <h2 className='mb32'>Archway<br />Rewards</h2>
                {/* <button type='button' onClick={()=>next()}>Next</button> */}
            </div>
            <Col  xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} className='mb32'>
                <p className='mb8'>
                    Archway's incentivized smart contracts allow you to collect a portion of the gas fees paid when your NFTs are sold or transferred. Set the rewards address to begin recieving rewards.<br />
                </p>
                <div className='lightText12'>Current rewards address: {loadingMetadata ? <SmallLoader /> : metadata?.rewardsAddress || <span style={{color: 'red'}}>{loadingMetadataError ? loadingMetadataError : 'Not Set. You are not earning rewards!'}</span> }</div>

            </Col>

            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} >
                        <label>
                            New Rewards Payment Address
                            <input value={state.address} onChange={e=>updateState({address: e.target.value})} placeholder='archway1a2b...' />
                        </label>
                        <div style={{textAlign: 'right', cursor: 'pointer'}} className={`${styles.spanButton} wide`} onClick={()=>updateState({address: user?.address || ''})}>Use my address</div>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default RewardsPage;