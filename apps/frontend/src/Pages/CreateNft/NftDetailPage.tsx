import { CATEGORIES } from "@architech/lib";
import { cw721 } from "@architech/types";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../Components/MultiSelect";

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
}

export const DefaultDetailState: DetailState = {
    tokenId: '',
    name: '',
    description: '',
    attributes: [DefaultTrait],
    externalLink: '',
}

const DetailPage: FC<{
    state: DetailState,
    onChange: (detail: DetailState)=>void;
    next: ()=>void;
}> = ({state, onChange, next}): ReactElement => {
    const [errors, setErrors] = useState<Partial<DetailState>>()
    const updateDetailState = (newDetailState: Partial<DetailState>) => {
        onChange({...state, ...newDetailState})
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
                            <input value={state.name} onChange={(e)=>updateDetailState({name: e.target.value})} className={errors?.name && styles.error} />
                            {!!errors?.name &&
                                <div className={styles.alert}>
                                    <img src='/alert.svg' style={{height:'1.5em'}} />
                                </div>
                            }
                            </div>
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Token ID
                            <input value={state.tokenId} onChange={(e)=>updateDetailState({tokenId: e.target.value})} className={errors?.tokenId && styles.error}  />
                            {!!errors?.tokenId &&
                                <div className={styles.alert}>
                                    <img src='/alert.svg' style={{height:'1.5em'}} />
                                </div>
                            }
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
                            <input placeholder='http://' value={state.externalLink} onChange={(e)=>updateDetailState({externalLink: e.target.value})} />
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
                                <input value={state.attributes[0].trait_type} onChange={(e)=>updateAttribute(0, {trait_type: e.target.value})} />
                            }
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Attribute Value
                            { !!state.attributes[0] && 
                                <input value={state.attributes[0].value} onChange={(e)=>updateAttribute(0, {value: e.target.value})} />
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
                                <input value={attribute.trait_type} onChange={(e)=>updateAttribute(index, {trait_type: e.target.value})} />
                            </label>
                        </Col>
                        <Col>
                            <label>
                                <input value={attribute.value} onChange={(e)=>updateAttribute(index, {value: e.target.value})} />
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