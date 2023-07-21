import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";

import styles from '../create.module.scss'

export interface State {
    address: string;
}

export const DefaultState: State = {
    address: '',
}

const CollectionAddressPage: FC<{
    state: State,
    onChange: (newState: State)=>void;
    next: ()=>void;
    handleLookup: ()=>Promise<void>;
}> = ({state, onChange, next, handleLookup}): ReactElement => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>()

    const updateState = (newState: Partial<State>) => {
        onChange({...state, ...newState})
    }

    const handleNext = async () => {
        setLoading(true);
        setError(undefined);
        try {
            await handleLookup();
            next();
        } catch (err: any) {
            console.error(`Failed to lookup collection ${state.address}`, err)
            if (err.toString().includes('decoding bech32 failed')) setError('Invalid contract address.')        
            else if (err.toString().includes('contract: not found'))  setError('Contract not found.')   
            else setError(err.toString())
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        handleNext();
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Collection<br />Address</h2>
                <button disabled={loading} type='button' onClick={()=>handleNext()}>Next</button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
            <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Address
                            <input placeholder='archway1a2b...' value={state.address} onChange={(e)=>updateState({address: e.target.value})} className={error ? 'error' : undefined} />
                            {!!error &&
                            <>
                                <div className='inputAlert'>
                                    <img alt='alert' src='/alert.svg' style={{height:'1.5em'}} />
                                </div>
                                <p>{error}</p>
                                </>
                            }
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default CollectionAddressPage;