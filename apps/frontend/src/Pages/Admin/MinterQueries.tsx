import { getConfig, getMintStatus, getPrice } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {Buffer} from 'buffer';

import styles from './create.module.scss'
import { useUser } from "../../Contexts/UserContext";
import SmallLoader from "../../Components/SmallLoader";
import { QueryClient } from "../../Utils/queryClient";
import ReactJson from "react-json-view";

type LOADING = 'config' | 'price' | 'adminfee'
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

    const handleGetPrice = async (e: any) => {
      e.preventDefault();

      setLoading('price');
      try {
          const result = await getPrice({client: QueryClient, contract: minterAddress});
          console.log(result);
          setData(result)
      } catch (err: any) {
          console.error(err)
          toast.error(err.toString());
      }
      setLoading(undefined);
    }

    const handleGetMintStatus = async (e: any) => {
      e.preventDefault();

      setLoading('price');
      try {
          const result = await getMintStatus({client: QueryClient, contract: minterAddress});
          console.log(result);
          setData(result)
      } catch (err: any) {
          console.error(err)
          toast.error(err.toString());
      }
      setLoading(undefined);
    }

    const handleGetAdminFee = async (e: any) => {
      e.preventDefault();

      setLoading('adminfee');
      try {
        const rawData = await QueryClient.queryContractRaw(minterAddress, new Uint8Array(Buffer.from('fee')))
        if (!rawData) throw new Error('No data found at key `fee`')
        const string: string = Buffer.from(rawData).toString()
        const obj = JSON.parse(string);

        console.log(obj);
        setData(obj)
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
            
            <form className={styles.form} onSubmit={()=>{}}>
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
                <button type='button' disabled={!!loading} onClick={handleGetAdminFee}>Query Admin Fee{loading==='adminfee' && <>&nbsp;<SmallLoader /></>}</button>
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