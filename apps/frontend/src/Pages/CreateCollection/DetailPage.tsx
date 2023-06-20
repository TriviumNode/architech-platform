import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";

import styles from './create.module.scss'

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

const DetailPage: FC<{
    data: DetailState,
    onChange: (detail: DetailState)=>void;
}> = ({data, onChange}): ReactElement => {

    const updateDetailState = (newDetailState: Partial<DetailState>) => {
        console.log(newDetailState)
        onChange({...data, ...newDetailState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Collection<br />Details</h2>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Name
                            <input value={data.name} onChange={(e)=>updateDetailState({name: e.target.value})} />
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Collection Symbol
                            <input value={data.symbol} onChange={(e)=>updateDetailState({symbol: e.target.value})} />
                        </label>
                    </Col>
                </div>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Collection Image
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { data.profileImage ? data.profileImage.name : 'Select a file' }
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
                                    { data.bannerImage ? data.bannerImage.name : 'Select a file' }
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
                </div>
                <div className='d-flex mb24'>
                    <Col xs={6}>
                        <label>
                            Category
                            <MultiSelect title={'Select...'} style={{marginTop: '8px'}} options={CATEGORIES} selected={data.categories} onChange={(selected) => updateDetailState({ categories: selected })} />
                        </label>
                    </Col>
                </div>
                <div className='d-flex'>
                    <Col>
                        <label>
                            Description
                            <textarea value={data.description} onChange={(e)=>updateDetailState({description: e.target.value})} />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default DetailPage;