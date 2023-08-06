import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement, useEffect, useRef, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../../Components/MultiSelect";
//@ts-ignore
import Papa from 'papaparse';

import styles from '../create.module.scss'
import { cw2981 } from "@architech/types";
import SmallLoader from "../../../Components/SmallLoader";
import PreloadDropzone, { FileWithPreview } from "../../../Components/PreloadDropzone";
import Badge from "../../../Components/Badge";

export interface PreloadState {
    items: IdMetadata[],
    csv_file: File | undefined,
    json_file: File | undefined,
    images: FileWithPreview[],
    invalidFiles: string[],
}

export const DefaultPreloadState: PreloadState = {
    items: [],
    csv_file: undefined,
    json_file: undefined,
    images: [],
    invalidFiles: [],
}

export interface IdMetadata extends cw2981.Metadata {
  file_name: string;
}

const MinterPreloadPage: FC<{
    state: PreloadState,
    onChange: (detail: PreloadState)=>void;
}> = ({state, onChange}): ReactElement => {
    const [errors, setErrors] = useState<Partial<PreloadState>>()
    const [parsingCsv, setParsingCsv] = useState(false)
    const [parsingJson, setParsingJson] = useState(false)
    const stateRef = useRef(state);
    stateRef.current = state;

    const updateState = (newDetailState: Partial<PreloadState>) => {
        onChange({...stateRef.current, ...newDetailState})
    }

    useEffect(()=>{
        if (!state.json_file) return;
        setParsingJson(true);
        try {
            state.json_file.text().then((data)=>{
                const obj: IdMetadata[] = JSON.parse(data);
                const newMetadata: IdMetadata[] = [];
                obj.forEach(m=>{
                    newMetadata.push({
                        file_name: m.file_name,
                        name: m.name,
                        description: m.description,
                        royalty_payment_address: m.royalty_payment_address,
                        royalty_percentage: m.royalty_percentage,
                        image: m.image,
                        attributes: m.attributes,
                        animation_url: m.animation_url,
                        background_color: m.background_color,
                        external_url: m.external_url,
                        image_data: m.image_data,
                        youtube_url: m.youtube_url,
                    })
                })
                updateState({items: newMetadata})
                setParsingJson(false);
            })
        } catch(error: any) {
            console.error('Failed to parse JSON', error)
            toast.error(error.toString())
        }
    },[state.json_file])

    useEffect(()=>{
        if (!state.csv_file) return;
        setParsingCsv(true);
        Papa.parse(state.csv_file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results: any) {
              console.log(results.data)
              const newMetadata: IdMetadata[] = [];
              results.data.forEach((r: any)=>{
                const attributes: cw2981.Trait[] = [];
                [1,2,3,4,5,6,7,8].forEach(t=>{
                    if (!r[`Trait ${t} Type`] && !r[`Trait ${t} Value`]) return;

                    if (
                        r[`Trait ${t} Type`] && !r[`Trait ${t} Value`]
                    ) throw new Error(`Item with ID ${r['File Name']} has an invalid trait: Trait ${t} has a Type but no Value.`)
                    if (
                        r[`Trait ${t} Value`] && !r[`Trait ${t} Type`]
                    ) throw new Error(`Item with ID ${r['File Name']} has an invalid trait: Trait ${t} has a Value but no Type.`)
                    
                    attributes.push({
                        trait_type: r[`Trait ${t} Type`],
                        value: r[`Trait ${t} Value`],
                    });
                })
                newMetadata.push({
                    file_name: r['File Name'],
                    name: r['Name'],
                    description: r['Description'],
                    royalty_payment_address: r['Royalty Address'],
                    royalty_percentage: r['Royalty Percent'],
                    image: r['Image URL'],
                    attributes,
                })
              })

              updateState({items: newMetadata})
              setParsingCsv(false);
            },
        });
    },[state.csv_file])

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Preload<br />Items</h2>
            </div>
            <p>
                Upload a CSV or JSON file to preload items into your random minter.
                <br />
                See the <a href="https://docs.architech.zone/preload.html" className='textLink' target='_blank' rel="noreferrer noopener">Architech Documentation</a> for more information.
            </p>
            <div style={{width: 'fit-content'}} className='mb16'>
                <Badge style={{fontSize: '16px'}}>
                    {state.items.length} NFTs found
                </Badge>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={true}>
                        <label>
                            CSV
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.csv_file ? state.csv_file.name : 'Select a file' }
                                </div>
                                {parsingCsv && <SmallLoader />}
                                <img alt='Upload' src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept=".csv"
                                    disabled={parsingCsv}
                                    onChange={(e)=>{
                                        if (e.target.files) updateState({csv_file: e.target.files[0]})
                                    }}
                                />
                            </label>
                        </label>
                        <div className='lightText11' style={{margin: '4px 8px 0 8px', textAlign: 'right'}}>
                            <a target='blank' href='/architech-template.csv'>Download template</a>
                        </div>
                    </Col>
                    <Col>
                        <label>
                            JSON
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.json_file ? state.json_file.name : 'Select a file' }
                                </div>
                                {parsingJson && <SmallLoader />}
                                <img alt='Upload' src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept=".json"
                                    disabled={parsingJson}
                                    onChange={(e)=>{
                                        if (e.target.files) updateState({json_file: e.target.files[0]})
                                    }}
                                />
                            </label>
                        </label>
                        <div className='lightText11' style={{margin: '4px 8px 0 8px', textAlign: 'right'}}>
                            <a target='blank' href='/architech-template.json'>Download template</a>
                        </div>
                    </Col>
                </div>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={true}>
                        <h4>Images</h4>
                        {/* <label>
                            Images
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.zip_file ? state.zip_file.name : 'Select a file' }
                                </div>
                                <img alt='Upload' src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept=".zip"
                                    onChange={(e)=>{
                                        if (e.target.files) updateState({zip_file: e.target.files[0]})
                                    }}
                                />
                            </label>
                        </label>
                        <div className='lightText11' style={{margin: '4px 8px 0 8px', textAlign: 'right'}}>
                            Upload a zip file containing images. Images should be PNG, JPG, or GIF and have a name matching the ID of an item uploaded above.
                        </div> */}
                        <label>
                            <span>Upload NFT images here. Max size: 5MB each.</span>
                        <PreloadDropzone disabled={!state.items.length} images={state.images} invalidFiles={state.invalidFiles} setImages={(newImages)=>updateState({images: newImages})} />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default MinterPreloadPage;