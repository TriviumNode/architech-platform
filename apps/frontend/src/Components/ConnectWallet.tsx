import { faWallet } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FC, ReactElement } from "react"

const ConnectWallet: FC<{ text?: string }> = ({ text }): ReactElement => {

    return (
        <div className='card d-flex align-items-center justify-content-center flex-column' style={{height: 'calc(100vh - 64px - 16px - 8px)'}}>
            <FontAwesomeIcon size='4x' icon={faWallet} className='mb16' />
            <div style={{fontSize: '32px'}}>{ text || 'Connect your wallet to access this page'}</div>
        </div>
    );
}

export default ConnectWallet;