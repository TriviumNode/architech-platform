import { ADMINS, CATEGORIES } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from './create.module.scss'
import { purgeAsks, purgeCollection, purgeTokens, refreshAsks, refreshCollection } from "../../Utils/backend";
import ConnectWallet from "../../Components/ConnectWallet";
import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../../Components/SmallLoader";

type LOADING = 'refresh' | 'purge' | 'purgetokens' | 'refreshasks' | 'purgeasks'
const AdminTasksPage: FC<{}> = (): ReactElement => {
    const { user } = useUser()
    const [collectionAddress, setCollectionAddress] = useState('');
    const [loading, setLoading] = useState<LOADING>();

    const handleRefresh = async (e: any) => {
        e.preventDefault();

        setLoading('refresh');
        try {
            const result = await refreshCollection(collectionAddress);
            console.log(result);
            toast.success('Refreshed Collection')
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
        setLoading(undefined);
    }

    const handlePurge = async (e: any) => {
        e.preventDefault();

        setLoading('purge');
        try {
            const result = await purgeCollection(collectionAddress);
            console.log(result);
            toast.success('Purged Collection')
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
        setLoading(undefined);
    }

    const handlePurgeTokens = async (e: any) => {
        e.preventDefault();

        setLoading('purgetokens');
        try {
            const result = await purgeTokens(collectionAddress);
            console.log(result);
            toast.success('Purged Tokens')
        } catch (err: any) {
            console.error(err)
            toast.error(err.toString());
        }
        setLoading(undefined);
    }

    const handlePurgeAsks = async (e: any) => {
      e.preventDefault();

      setLoading('purgeasks');
      try {
        const result = await purgeAsks(collectionAddress);
        console.log(result);
        toast.success('Purged Asks')
      } catch (err: any) {
        console.error(err)
        toast.error(err.toString());
      }
      setLoading(undefined);
    }

    const handleRefreshAsks = async (e: any) => {
      e.preventDefault();

      setLoading('refreshasks');
      try {
        const result = await refreshAsks(collectionAddress);
        console.log(result);
        toast.success('Refreshed Asks')
      } catch (err: any) {
        console.error(err)
        toast.error(err.toString());
      }
      setLoading(undefined);
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Collection<br />Tasks</h2>
            </div>
            
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Address
                            <input value={collectionAddress} onChange={(e)=>setCollectionAddress(e.target.value)} />
                        </label>
                    </Col>
                </div>
            </form>
            <div className='d-flex gap8 justify-content-center'>
                <button type='button' disabled={!!loading} onClick={handleRefresh}>Refresh Collection{loading==='refresh' && <>&nbsp;<SmallLoader /></>}</button>
                <button type='button' disabled={!!loading} onClick={handleRefreshAsks}>Refresh Asks{loading==='refreshasks' && <>&nbsp;<SmallLoader /></>}</button>
                <button type='button' disabled={!!loading} onClick={handlePurgeAsks}>Purge Asks{loading==='purgeasks' && <>&nbsp;<SmallLoader /></>}</button>
                <button type='button' disabled={!!loading} onClick={handlePurgeTokens}>Purge Tokens{loading==='purgetokens' && <>&nbsp;<SmallLoader /></>}</button>
                <button type='button' disabled={!!loading} onClick={handlePurge} style={{background: 'red'}}>Purge Collection{loading==='purge' && <>&nbsp;<SmallLoader /></>}</button>
            </div>
        </div>
    )
}

export default AdminTasksPage;