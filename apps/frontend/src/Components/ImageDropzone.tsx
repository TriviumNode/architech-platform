import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'

export default function ImageDropzone() {
    const [file, setFile] = useState<File>()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles)
    // setFile(acceptedFiles[0])

    const file = acceptedFiles[0]
    const reader = new FileReader()
  
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        console.log('binaryStr', binaryStr)
        // if (binaryStr)
            // setFile(binaryStr)
    }

    reader.readAsArrayBuffer(file)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <>
        { !!file && <p>{file?.name}</p>}
        <div {...getRootProps()}>
        <input {...getInputProps()} />
        {
            <>
                <button type="button">Select file</button>
            </>
        }
        </div>
    </>
  )
}