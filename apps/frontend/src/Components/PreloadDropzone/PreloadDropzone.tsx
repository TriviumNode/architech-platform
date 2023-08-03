import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import {useDropzone} from 'react-dropzone';
import { toast } from 'react-toastify';
import Loader from '../Loader';
import styles from './PreloadDropzone.module.scss';

export const blobToData = (blob: Blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export type FileWithPreview = {file: File, preview: any}

export default function PreloadDropzone(
  {
    images: acceptedFiles,
    setImages: setAcceptedFiles,
    invalidFiles,
    disabled
  }:{ 
    images: FileWithPreview[];
    setImages: (newImages: FileWithPreview[])=>void;
    invalidFiles: string[];
    disabled: boolean;
  }){
    const filesRef = useRef<FileWithPreview[]>(acceptedFiles);
    const invalidFilesRef = useRef<string[]>(invalidFiles);
    filesRef.current = acceptedFiles;
    invalidFilesRef.current = invalidFiles;

    const onDrop = useCallback((files: File[]) => {
      if (disabled) return;
      const newFiles: FileWithPreview[] = []
      files.forEach(f=>{
        if (filesRef.current.findIndex(fi=>fi.file.name === f.name) === -1)
          newFiles.push({file: f, preview: undefined});
      })
      setAcceptedFiles([...filesRef.current, ...newFiles]);

    
      // files.forEach((f)=>{
      //   var fr = new FileReader();
      //   fr.onload = function () {
      //     console.log('GOT IT', acceptedFiles)
      //     setAcceptedFiles([...acceptedFiles, {file: f, preview: fr.result}]);
      //   }
      //   fr.readAsDataURL(f);
      //   console.log('WAIT')
      // })
      
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});


    useEffect(()=>{
      acceptedFiles.filter(f=>!f.preview).forEach((f, i)=>{
        processFile(f.file)
      })
    },[acceptedFiles]);

    const processFile = async (file: File) => {
      const preview = await blobToData(file);
      const index = acceptedFiles.findIndex(a=>a.file.name === file.name);
      if (index > -1){
        const newFiles = [...acceptedFiles];
        newFiles[index] = {file, preview}
        setAcceptedFiles(newFiles);
      }
      else setAcceptedFiles([...acceptedFiles, {file, preview}])
    }

    const removeImage = (index: number) => {
      const newFiles = [...filesRef.current];
      newFiles.splice(index,1)
      console.log(newFiles)
      setAcceptedFiles(newFiles);
    }

  // useEffect(()=>{
  //   acceptedFiles.forEach((f, i)=>{
  //     var fr = new FileReader();
  //     fr.onload = function () {
  //         const newPreviews = [...previews]
  //         previews[i] = fr.result
  //     }
  //     fr.readAsDataURL(f);
  //   })
  // },[acceptedFiles]);

  const handleRemoveImage = (e: any) => { 
    e.preventDefault();
    e.stopPropagation();
    try {
      const toRemove = e.currentTarget.getAttribute('data-file-id')
      if (!toRemove) throw new Error('Image ID to remove not defined');
      removeImage(toRemove);
    } catch(err: any) {
      toast.error(err.toString())
    }
  }

  const files = acceptedFiles.map((f, i)=>(
    <div key={f.file.name} style={{ border: '1px solid rgb(0,0,0,0.15)'}} className={`br8 ${invalidFiles.includes(f.file.name) ? styles.invalidFile : undefined}`} data-file-id={i} onClick={handleRemoveImage}>
      { !!f.preview ?
      <div className={`${styles.imgContainer} ${invalidFiles.includes(f.file.name) ? styles.invalidFile : undefined}`}>
        <img src={f.preview as string} alt={f.file.name} className='imgCover wide tall' />
        <div className={styles.overlay}>
          <FontAwesomeIcon icon={faTrashCan} size='4x' color='#333' />
        </div>
        <div className={styles.fileName}>
          {f.file.name}
        </div>
      </div>
      :
        <Loader />
      }
      
    </div>
  ))

  const noClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }

  let inputProps = getInputProps();
  if (disabled) inputProps = {...inputProps, onClick: noClick, onChange: noClick}
  return (
    <div style={{
      border: '1px solid rgb(0,0,0,0.15)',
      borderRadius: '8px',
      padding: '8px',
      background: disabled ? '#DEDEDE' : undefined,
      color: disabled ? '#232323' : undefined
    }}>
    <section>
      <div {...getRootProps({className: 'dropzone br8 mb8'})} style={{
        padding: '8px',
        border: '2px dashed rgb(0,0,0,0.2)',
        cursor: disabled ? 'default' : 'pointer'
      }}>
        <input {...inputProps} />
        <div style={{padding: '16px', textAlign: 'center', fontSize: '16px'}} className='br8 mb8'>
        {
          isDragActive && !disabled ?
            <p>Drop the images here ...</p> :
            disabled ?
              <p>Upload a CSV or JSON before uploading images.</p>
            : <p>Click or tap to select images, or drag and drop images here.</p>
        }
        </div>

      </div>


    </section>
    <aside onClick={noClick}>
      <div className='grid-4 wide'>{files}</div>
    </aside>
  </div>
  );
}