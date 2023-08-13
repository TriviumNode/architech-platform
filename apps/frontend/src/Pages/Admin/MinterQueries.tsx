import { ADMINS, CATEGORIES, getConfig } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from './create.module.scss'
import { purgeCollection, purgeTokens, refreshCollection } from "../../Utils/backend";
import ConnectWallet from "../../Components/ConnectWallet";
import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import ReactJson from "react-json-view";

type LOADING = 'config'
const AdminMinterQueries: FC<{}> = (): ReactElement => {
    const { user } = useUser()
    const [minterAddress, setMinterAddress] = useState('');
    const [loading, setLoading] = useState<LOADING>();
    const [data, setData] = useState<any>();

    const handleGetConfig = async (e: any) => {
        e.preventDefault();

        setLoading('config');
        try {
            const result = await getConfig({client: QueryClient, contract: minterAddress});
            console.log(result);
            setData(result)
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
        setLoading(undefined);
    }


    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Minter<br />Queries</h2>
            </div>
            
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Minter Address
                            <input value={minterAddress} onChange={(e)=>setMinterAddress(e.target.value)} />
                        </label>
                    </Col>
                </div>
            </form>
            <div className='d-flex gap8 justify-content-center mb24'>
                <button type='button' disabled={!!loading} onClick={handleGetConfig}>Query Config{loading==='config' && <>&nbsp;<SmallLoader /></>}</button>
                {/* <button type='button' disabled={!!loading} onClick={handlePurgeTokens}>Purge Tokens{loading==='purgetokens' && <>&nbsp;<SmallLoader /></>}</button> */}
                {/* <button type='button' disabled={!!loading} onClick={handlePurge} style={{background: 'red'}}>Purge Collection{loading==='purge' && <>&nbsp;<SmallLoader /></>}</button> */}
            </div>
            <div className='d-flex gap8 justify-content-center'>
                <ReactJson src={data} />
            </div>
        </div>
    )
}

export default AdminMinterQueries;