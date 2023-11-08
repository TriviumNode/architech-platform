import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-expect-error
import { Switch } from 'react-switch-input';

import styles from '../create.module.scss'

export interface DetailState {
    name: string,
    symbol: string,
    profileImage?: File,
    bannerImage?: File,
    categories: string[];
    description: string;
    hidden: boolean;
}

export const DefaultDetailState: DetailState = {
    name: '',
    symbol: '',
    categories: [],
    description: '',
    hidden: true,
}

const CollectionDetailPage: FC<{
    state: DetailState,
    current: DetailState,
    isEditing?: boolean,
    isImporting?: boolean,
    onChange: (detail: DetailState)=>void;
    next?: ()=>void;
}> = ({state, current, isEditing, isImporting, onChange, next}): ReactElement => {
    const [errors, setErrors] = useState<Partial<DetailState>>()

    const updateDetailState = (newDetailState: Partial<DetailState>) => {
        onChange({...state, ...newDetailState})
    }

    const handleNext = (e: any) => {
        e.preventDefault();
        if (!next) return;

        if (validateForm()) {
            toast.error('Please fill all required fields.')
        } else {
            next();
        }
    }
    const validateForm = () => {
        const newErrors: Partial<DetailState> = {}
        if (!state.name) newErrors.name='true';
        if (!state.symbol) newErrors.symbol='true';
        if(Object.keys(newErrors).length){
            setErrors(newErrors);
            return true;
        } else
            return false;
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
              <h2 className='mb32'>Collection<br />Details</h2>
              { !!next && <button type='button' onClick={handleNext}>Next</button> }
            </div>
            
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Name
                            <input
                              value={state.name}
                              onChange={(e)=>updateDetailState({name: e.target.value.replace(/[<>]/gi, '')})}
                              className={errors?.name && 'error'}
                              maxLength={128}
                            />
                            {!!errors?.name &&
                                <div className='inputAlert'>
                                    <img alt='alert' src='/alert.svg' style={{height:'1.5em'}} />
                                </div>
                            }
                        </label>
                    </Col>
                    { isEditing ?
                        <>
                        <Col xs={6}>
                            <label>
                                Category
                                <MultiSelect title={'Select...'} style={{ marginTop: '8px' }} options={CATEGORIES} selected={state.categories} onChange={(selected) => updateDetailState({ categories: selected })} />
                            </label>
                        </Col>
                    </>
                    :
                        <Col>
                            <label>
                                Collection Symbol
                                <input
                                  value={state.symbol}
                                  disabled={isImporting}
                                  onChange={(e)=>updateDetailState({symbol: e.target.value.replace(/[^a-zA-Z]/gi, '').toUpperCase()})}
                                  className={errors?.symbol && 'error'}
                                  maxLength={16}
                                />
                                {!!errors?.symbol &&
                                    <div className='inputAlert'>
                                        <img alt='alert' src='/alert.svg' style={{height:'1.5em'}} />
                                    </div>
                                }
                            </label>
                        </Col>
                    }

                </div>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={true}>
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
                        <div className='lightText11' style={{margin: '4px 8px 0 8px'}}>
                            Recommended Size: 350 x 350<br/>
                            Accepts JPG, PNG SVG, WEBP.&nbsp;&nbsp;Max size: 2 MB
                        </div>
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
                        <div className='lightText11' style={{margin: '4px 8px 0 8px'}}>
                            Recommended Size: 1080 x 350
                        </div>
                    </Col>
                </div>
                {!isEditing ?
                    <div className='d-flex mb24'>
                        <Col xs={12} md={6}>
                            <label>
                                Categories
                                <MultiSelect title={'Select...'} style={{marginTop: '8px'}} options={CATEGORIES} selected={state.categories} onChange={(selected) => updateDetailState({ categories: selected })} />
                            </label>
                        </Col>
                    </div>
                : current.hidden === true &&
                <Col>
                    <div className='d-flex align-items-center mb24'>
                        <Switch
                            checked={state.hidden}
                            onChange={(e: any) => updateDetailState({ hidden: e.target.checked })}
                        />
                        <div className='ml16'>
                            <span>Hide Collection</span><br />
                            <span className='lightText10'>Turn off to reveal your collection on Architech. </span>
                            <span className='lightText10' style={{textDecoration: 'underline'}}>This can not be undone.</span>
                        </div>
                    </div>
                </Col>
                }
                <div className='d-flex'>
                    <Col>
                        <label>
                            Description
                            <textarea
                              value={state.description}
                              onChange={(e)=>updateDetailState({description: e.target.value.replace(/[<>]/gi, '')})}
                              maxLength={512}
                            />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default CollectionDetailPage;