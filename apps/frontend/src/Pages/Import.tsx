import { Collection, User } from "@architech/types";
import React, {ReactElement, FC, useState, useEffect, ChangeEvent} from "react";
import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import { Link, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import FileInput from "../Components/FileInput";
import ImageDropzone from "../Components/ImageDropzone";
import { useUser } from "../Contexts/UserContext";
import { getCollection, getTokenCount, getTokens, importCollection, updateProfile, updateProfileImage } from "../Utils/backend";
import { useRevalidator } from 'react-router-dom'
import { AxiosError } from "axios";
import Loader from "../Components/Loader";

const emptyToUndefined =(str: string) => {
    return str.length ? str : undefined;
}

const ImportPage: FC<any> = (): ReactElement => {
    const { user } = useUser();
    const [address, setAddress] = useState<string>('') 
    const [importing, setImporting] = useState(false);
    const [collection, setCollection] = useState<Collection>()
    const [count, setCount] = useState(0);
    const [complete, setComplete] = useState(false);

    const handleEditAddress = (e: any) => {
        setAddress(e.target.value);
    }

    useEffect(() => {
        if (!importing) return;
        const interval = setInterval(() => {
            console.log('This will run every 5 seconds!');
            refreshImport();
        }, 5000);
        return () => clearInterval(interval);
    }, [importing]);

    const refreshImport = async () => {
        if (!collection || !importing) throw new Error('Unable to refresh collection import. No import is in progress.')
        const count = await getTokenCount(collection.address)
        setCount(count);
        if (count === collection.totalTokens){
            setComplete(true);
            setImporting(false);
        }
    }

    const handleImport = async (e: any) => {
        e.preventDefault();
        try {
            // const response = await importCollection(address);
            // console.log(response);
            // setImporting(true);
            // setCollection(response);
        } catch(err: any) {
            console.error(err)
            toast.error(err.response.data || err.message)
        }
    }

    const handleReset = (e: any) => {
        setCollection(undefined);
        setAddress('');
        setCount(0);
        setImporting(false);
        setComplete(false);
    }

    if (!user) return (
        <Row>
            Your wallet must be connected and authenticated to import a collection.
        </Row>
    )

    return (<>
        <Row>
            <h1>Import Existing Collection</h1>
        </Row>
        <Row style={{justifyContent: "center"}}>
            <Col xs={12} md={6}>
            { !importing ?
                complete ?
                <>
                <h3>Import Complete</h3>
                <p>
                    Successfully imported {count} tokens from {collection?.cw721_name}.<br />
                    <Link to={`/nfts/${collection?.address}`}>Visit your collection</Link> to edit the collection profile.
                </p>
                <button type="button" onClick={handleReset}>Import Another Collection</button>
                </>
                :
                <form onSubmit={handleImport}>
                    <Row>
                        <label>
                            Collection Address:
                            <input value={address} onChange={handleEditAddress} />
                        </label>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col xs="auto">
                            <button type="submit">Import</button>
                        </Col>
                    </Row>
                </form>
            :
            <>
                <h3>Importing collection {collection?.cw721_name}</h3>
                <h6>This may take several minutes.</h6>
                <p>{count} / {collection?.totalTokens} imported.</p>
                <Loader />
            </>
            }
            </Col>
        </Row>
    </>);
};

export default ImportPage;