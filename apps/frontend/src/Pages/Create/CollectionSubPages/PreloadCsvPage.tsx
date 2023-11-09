import { FC, ReactElement, useEffect, useRef, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
//@ts-ignore
import Papa from 'papaparse';

import styles from '../create.module.scss'
import { cw2981, minter } from "@architech/types";
import SmallLoader from "../../../Components/SmallLoader";
import PreloadDropzone, { FileWithPreview } from "../../../Components/PreloadDropzone";
import Badge from "../../../Components/Badge";
import { IdMetadata, PreloadState } from "./PreloadJsonPage";

// export interface PreloadState {
//     items: IdMetadata[],
//     csv_file: File | undefined,
//     images: FileWithPreview[],
//     invalidFiles: string[],
// }

// export const DefaultPreloadState: PreloadState = {
//     items: [],
//     csv_file: undefined,
//     images: [],
//     invalidFiles: [],
// }

// export interface IdMetadata extends cw2981.Metadata {
//   file_name: string;
// }

const PreloadCsvPage: FC<{
    state: PreloadState,
    onChange: (detail: PreloadState)=>void;
    minterStatus: minter.GetMintStatusResponse | undefined;
}> = ({state, onChange, minterStatus}): ReactElement => {
    const [errors, setErrors] = useState<Partial<PreloadState>>()
    const [parsingCsv, setParsingCsv] = useState(false)
    const stateRef = useRef(state);
    stateRef.current = state;

    const updateState = (newDetailState: Partial<PreloadState>) => {
        onChange({...stateRef.current, ...newDetailState})
    }

    useEffect(()=>{
        if (!state.csv_file) return;
        // updateState({json_file: undefined})
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
            <div style={{width: 'fit-content'}}>
              <p>
                Upload a CSV file to preload items into your random minter. <a className='textLink' target='blank' href='/architech-template.csv'>Download the template</a> to get started.<br />
                Split large collections into multiple CSV files to preload in batches.<br />
                <span className='mt8 d-block' />
                See the <a href="https://docs.architech.zone/preload.html" className='textLink' target='_blank' rel="noreferrer noopener">Architech Documentation</a> for more information.  
              </p>
              <div className='mb16 d-flex justify-content-between'>
                  <Badge style={{fontSize: '16px'}}>
                      {!state.csv_file && !state.items.length ?
                        'No Files Selected'
                      :
                        `${state.items.length} NFTs selected`
                      }
                  </Badge>
                  <Badge style={{fontSize: '16px'}}>
                      {minterStatus ? minterStatus.remaining : <SmallLoader />} NFTs Already Preloaded
                  </Badge>
              </div>
            </div>
            <form className={styles.form} onSubmit={()=>{}}>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={6}>
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
                </div>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={true}>
                        <h4>Images</h4>
                        <label>
                          <span>Upload NFT images here. Max size: 5MB each.</span>
                          <PreloadDropzone
                            disabled={!state.items.length}
                            images={state.images}
                            invalidFiles={state.invalidFiles}
                            setImages={(newImages)=>updateState({images: newImages})}
                            fileType='CSV'
                          />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default PreloadCsvPage;