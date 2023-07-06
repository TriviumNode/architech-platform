import { CATEGORIES, getNftInfo, getNumTokens, randomString } from "@architech/lib";
import { Collection, cw721 } from "@architech/types";
import { FC, ReactElement, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../Components/MultiSelect";
import { QueryClient } from "../../Utils/queryClient";

import styles from './createNft.module.scss'

export const DefaultTrait: cw721.Trait = {
    trait_type: '',
    value: ''
}

export interface DetailState {
    tokenId: string,
    name: string,
    description: string;
    attributes: cw721.Trait[];
    image?: File,
    externalLink: string,
    customId: boolean,
    customName: boolean,
}

export const DefaultDetailState: DetailState = {
    tokenId: '',
    name: '',
    description: '',
    attributes: [DefaultTrait],
    externalLink: '',
    customId: false,
    customName: false,
}

const DetailPage: FC<{
    state: DetailState,
    collection: Collection,
    onChange: (detail: DetailState)=>void;
    next: ()=>void;
}> = ({state, collection, onChange, next}): ReactElement => {
    const [errors, setErrors] = useState<Partial<DetailState>>()

    const [defaultId, setDefaultId] = useState<string>();

    const updateDetailState = (newDetailState: Partial<DetailState>) => {
        onChange({...state, ...newDetailState})
    }

    const updateTokenId = (newId: string) => {
        const filtered = newId//.replace(/[^a-zA-Z0-9]/gi, '');
        updateDetailState({ tokenId: filtered })
    }

    const deleteAttribute = (index: number) => {
        const newAttributes = [...state.attributes];
        newAttributes.splice(index, 1);
        updateDetailState({attributes: newAttributes})
    }

    const addAttribute = () => {
        const newAttributes = [...state.attributes];
        newAttributes.push(DefaultTrait)
        updateDetailState({attributes: newAttributes})
    }

    const updateAttribute = (index: number, newAttribute: Partial<cw721.Trait>) => {
        const newAttributes = [...state.attributes];
        newAttributes[index] = {...newAttributes[index], ...newAttribute};
        updateDetailState({attributes: newAttributes})
    }

    const handleNext = (e: any) => {
        e.preventDefault();
        if (validateForm()) {
            toast.error('Please fill all required fields.')
        } else {
            next();
        }
    }

    const validateForm = () => {
        const errors: Partial<DetailState> = {}
        if (!state.name) errors.name='true';
        if (!state.tokenId) errors.tokenId='true';
        if(Object.keys(errors).length){
            setErrors(errors);
            return true;
        } else
            return false;
    }

    const getDefaultId = async() => {
        let toSet = randomString(6);
        let maybe;
        try {
            const numTokens = await getNumTokens({client: QueryClient, contract: collection.address})
            maybe = (numTokens + 1).toString();
            const check = await getNftInfo({ client: QueryClient, contract: collection.address, token_id: maybe })
            if (!check) toSet = maybe;
        } catch (err: any) {
            if (err.toString().includes('not found: query wasm contract failed: invalid request') && maybe)
                toSet = maybe;
            else {
                console.error('Error getting default ID for', collection.address, err);
            }
        }
        setDefaultId(toSet)
        let update = {}
        // if (!customName) updateDetailState({name: `${collection.collectionProfile.name || collection.cw721_name} #${toSet}`})
        // if (!customId) updateDetailState({tokenId: toSet})
        if (!state.customName) update = { name: `${collection.collectionProfile.name || collection.cw721_name} #${toSet}` }
        if (!state.customId) update = { ...update, tokenId: toSet }
        if (Object.keys(update).length) updateDetailState(update);
    }

    const validateId = async () => {
        try {
            const nftInfo = await getNftInfo({ client: QueryClient, contract: collection.address, token_id: state.tokenId })
            if (nftInfo){
                const newErrors: Partial<DetailState> = { ...errors, tokenId: 'Token ID is already in use.' }
                setErrors(newErrors);
            }
        } catch (err: any) {
            console.log('Check ID Error', err)
            // should be OK
        }
    }

    useEffect(()=>{
        getDefaultId()
    },[])

    useEffect(()=>{
        if (state.customId) return;
        if (!defaultId) getDefaultId()
        else updateTokenId(defaultId);
    },[state.customId])

    useEffect(()=>{
        if (state.customName) return;
        if (!defaultId) getDefaultId()
        else updateDetailState({name: `${collection.collectionProfile.name || collection.cw721_name} #${defaultId}`})
    },[state.customName])

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>NFT<br />Details</h2>
                <button type='button' onClick={handleNext}>Next</button>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Item Name
                            <div className='d-flex flex-column wide'>
                                <div className='lightText10' style={{margin: '4px 8px 0 8px'}}>
                                    Display name for this NFT. Does not have to be unique.
                                </div>
                                <input type='text' disabled={!state.customName} value={state.name} onChange={(e)=>updateDetailState({name: e.target.value})} className={errors?.name && styles.error} />
                                {!!errors?.name &&
                                    <div className={styles.alert}>
                                        <img alt='Alert' src='/alert.svg' style={{height:'1.5em'}} />
                                    </div>
                                }
                                <div style={{textAlign: 'right'}}>
                                    <input type='checkbox' checked={state.customName} onChange={()=>updateDetailState({customName: !state.customName})} />Customize Name
                                </div>
                            </div>
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Token ID
                            <div className='lightText10' style={{margin: '4px 8px 0 8px'}}>
                                Unique ID for this NFT. May only contain letters and numbers.
                            </div>
                            <input type='text' disabled={!state.customId} value={state.tokenId} onChange={(e)=>updateTokenId(e.target.value)} className={errors?.tokenId && styles.error}  />
                            {!!errors?.tokenId &&
                                <div className={styles.alert}>
                                    <img alt='Alert' src='/alert.svg' style={{height:'1.5em'}} />
                                </div>
                            }
                            <div style={{textAlign: 'right'}}>
                                <input type='checkbox' checked={state.customId} onChange={()=>updateDetailState({customId: !state.customId})} />Customize ID
                            </div>
                        </label>
                    </Col>
                </div>
                {/* <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Image
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.profileImage ? state.profileImage.name : 'Select a file' }
                                </div>
                                <img src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept="image/*"
                                    onChange={(e)=>{
                                        if (e.target.files) updateDetailState({profileImage: e.target.files[0]})
                                    }}
                                />
                            </label>
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Collection Banner
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.bannerImage ? state.bannerImage.name : 'Select a file' }
                                </div>
                                <img src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept="image/*"
                                    onChange={(e)=>{
                                        if (e.target.files) updateDetailState({bannerImage: e.target.files[0]})
                                    }}
                                />
                            </label>
                        </label>
                    </Col>
                </div> */}
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            External Link
                            <input type='text' placeholder='http://' value={state.externalLink} onChange={(e)=>updateDetailState({externalLink: e.target.value})} />
                        </label>
                    </Col>
                </div>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Description
                            <textarea placeholder='Type here' value={state.description} onChange={(e)=>updateDetailState({description: e.target.value})} />
                        </label>
                    </Col>
                </div>
                <div className='d-flex mb8'>
                    <Col>
                        <label>
                            Attribute Label
                            { !!state.attributes[0] && 
                                <input type='text' value={state.attributes[0].trait_type} onChange={(e)=>updateAttribute(0, {trait_type: e.target.value})} />
                            }
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Attribute Value
                            { !!state.attributes[0] && 
                                <input type='text' value={state.attributes[0].value} onChange={(e)=>updateAttribute(0, {value: e.target.value})} />
                            }
                        </label>
                    </Col>
                    <Col xs={'auto'} className='d-flex align-items-end'>
                        { !!state.attributes[0] && 
                            <button type='button' className={styles.lightButton} onClick={()=>deleteAttribute(0)}><img src='/trash.svg' style={{height: '16px'}} alt='Delete'/></button>
                        }
                    </Col>
                </div>
                { state.attributes.length > 1 && 
                    state.attributes.slice(1, state.attributes.length).map((attribute, index)=>{
                    index=index+1;
                    return (<div className='d-flex mb8'>
                        <Col>
                            <label>
                                <input type='text' value={attribute.trait_type} onChange={(e)=>updateAttribute(index, {trait_type: e.target.value})} />
                            </label>
                        </Col>
                        <Col>
                            <label>
                                <input type='text' value={attribute.value} onChange={(e)=>updateAttribute(index, {value: e.target.value})} />
                            </label>
                        </Col>
                        <Col xs={'auto'} className='d-flex align-items-end'>
                            <button type='button' className={styles.lightButton} onClick={()=>deleteAttribute(index)}><img src='/trash.svg' style={{height: '16px'}} alt='Delete'/></button>
                        </Col>
                    </div>)}
                    )
                }
                <div className='d-flex mb24'>
                    <Col xs={'auto'} className='d-flex align-items-end'>
                        <button type='button' className={styles.lightButton} onClick={()=>addAttribute()}>Add Attribute</button>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default DetailPage;