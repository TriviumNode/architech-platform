import { CATEGORIES } from "@architech/lib";
import { cw721 } from "@architech/types";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";

import styles from './create.module.scss'

const ImagePage: FC<{
    image: File | undefined,
    preview: any | undefined;
    onChange: (uploaded: File, preview: any)=>void;
    next: ()=>void;
}> = ({image, preview, onChange, next}): ReactElement => {

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (FileReader && e.target.files && e.target.files.length) {
                var fr = new FileReader();
                fr.onload = function () {
                    //@ts-expect-error
                    onChange(e.target.files[0], fr.result)
                }
                fr.readAsDataURL(e.target.files[0]);
            } else {
                onChange(e.target.files[0], undefined)
            }
        }
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex justify-content-between'>
                <h2 className='mb32'>NFT<br />Image</h2>
                <button type='button' onClick={()=>next()}>Next</button>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            NFT Image
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { image ? image.name : 'Select a file' }
                                </div>
                                <img src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                            </label>
                        </label>
                    </Col>
                </div>
            </form>
            { !!preview &&
                <div>
                    <img src={preview} alt='Uploaded' />
                </div>
            }
        </div>
    )
}

export default ImagePage;