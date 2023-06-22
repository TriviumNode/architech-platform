
import { FC, ReactElement } from 'react';
import styles from './FileSelect.module.scss';

const FileSelect: FC<{
    selected: File | undefined,
    onChange: (newFile: File)=>void;
}> = ({selected, onChange}): ReactElement => {
    return(
        <label className={styles.customfileupload}>
            <div className='ml16'>
                { selected?.name || 'Select a file' }
            </div>
            <img src='/upload.svg' alt='' style={{maxHeight: '1em' }} className='mr16' />
            <input
                type='file'
                accept="image/*"
                onChange={(e)=>{
                    if (e.target.files && e.target.files.length) onChange(e.target.files[0])
                }}
                className='d-none'
            />
        </label>
    );
}
export default FileSelect;