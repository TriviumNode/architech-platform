import { FC, ReactElement, useRef, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";

import styles from '../create.module.scss'
import { cw2981, minter } from "@architech/types";
import SmallLoader from "../../../Components/SmallLoader";
import PreloadDropzone, { FileWithPreview } from "../../../Components/PreloadDropzone";
import Badge from "../../../Components/Badge";

export interface PreloadState {
  items: IdMetadata[],
  csv_file: File | undefined,
  images: FileWithPreview[],
  invalidFiles: string[],
}

export const DefaultPreloadState: PreloadState = {
  items: [],
  csv_file: undefined,
  images: [],
  invalidFiles: [],
}

export interface IdMetadata extends cw2981.Metadata {
  file_name: string;
}

const PreloadJsonPage: FC<{
  state: PreloadState,
  onChange: (detail: PreloadState)=>void;
  minterStatus: minter.GetMintStatusResponse | undefined;
}> = ({state, onChange, minterStatus}): ReactElement => {
    const [errors, setErrors] = useState<Partial<PreloadState>>()
    const [parsingJson, setParsingJson] = useState<string>()
    const stateRef = useRef(state);
    stateRef.current = state;

    const updateState = (newDetailState: Partial<PreloadState>) => {
        onChange({...stateRef.current, ...newDetailState})
    }

    const importJson = (json_file: File) => {
      if (!json_file) return;
      setParsingJson(json_file.name);
      try {
          json_file.text().then((data)=>{
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
              updateState({items: [...state.items, ...newMetadata]})
              setParsingJson(undefined);
          })
      } catch(error: any) {
        console.error(`Failed to parse JSON ${json_file.name}:`, error)
        toast.error(error.toString())
        setParsingJson(undefined);
      }
    }

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>Preload<br />Items</h2>
            </div>
            <div style={{width: 'fit-content'}}>
              <p>
                Upload JSON files to preload items into your random minter. <a className='textLink' target='blank' href='/architech-template.json'>Download the template</a> to get started.<br />
                Split large collections into multiple JSON files to preload in batches.<br />
                <span className='mt8 d-block' />
                See the <a href="https://docs.architech.zone/preload.html" className='textLink' target='_blank' rel="noreferrer noopener">Architech Documentation</a> for more information.  
              </p>
              <div className='mb16 d-flex justify-content-between'>
                  <Badge style={{fontSize: '16px'}}>
                      {!state.items.length ?
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
            <form className={styles.form}>
                <div className='d-flex mb24 flex-wrap'>
                    <Col xs={12} md={6}>
                        <label>
                            JSON
                            <label className={styles.customfileupload}>
                                <div className='ml16'>
                                    { state.items.length ? 'Select another file to add more items' : 'Select a file' }
                                </div>
                                {parsingJson && <SmallLoader />}
                                <img alt='Upload' src='/upload.svg' style={{maxHeight: '1em' }} className='mr16' />
                                <input
                                    type='file'
                                    accept=".json"
                                    disabled={!!parsingJson}
                                    onChange={(e)=>{
                                        if (e.target.files) importJson(e.target.files[0]); //updateState({json_file: e.target.files[0]})
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
                        <label>
                          <span>Upload NFT images here. Max size: 5MB each.</span>
                          <PreloadDropzone
                            disabled={!state.items.length}
                            images={state.images}
                            invalidFiles={state.invalidFiles}
                            setImages={(newImages)=>updateState({images: newImages})}
                            fileType='JSON'
                          />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default PreloadJsonPage;