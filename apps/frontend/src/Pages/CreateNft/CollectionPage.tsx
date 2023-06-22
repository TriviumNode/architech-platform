import { CATEGORIES } from "@architech/lib";
import { Collection, cw721 } from "@architech/types";
import { FC, ReactElement, useState } from "react";
import { Col } from "react-bootstrap";
import { toast } from "react-toastify";
import MultiSelect from "../../Components/MultiSelect";
import SelectMenu, { SelectOption } from "../../Components/SelectMenu/SelectMenu";
import { useUser } from "../../Contexts/UserContext";

import styles from './create.module.scss'

export const DefaultTrait: cw721.Trait = {
    trait_type: '',
    value: ''
}

const collectionOption = (collection: Collection) => {
    return ({
        value: collection,
        content: (
            <div>
                <h4>{collection.collectionProfile.name || collection.cw721_name}</h4>
            </div>
        )
    });
}

const CollectionPage: FC<{
    collection: Collection | undefined,
    onChange: (collection: Collection)=>void;
    next: ()=>void;
}> = ({collection, onChange, next}): ReactElement => {
    const { user } = useUser();
    const [selected, setSelected] = useState<SelectOption | undefined>(collection ? collectionOption(collection) : undefined)

    // useEffect(()=>{

    // },[collection])

    const handleSelect = (newSelect: SelectOption) => {
        setSelected(newSelect);
        onChange(newSelect.value);
    }

    const handleNext = (e: any) => {
        next();
    }


    const collections = user?.profile.collections || []
    console.log('userProfile!', user?.profile)
    const options: SelectOption[] = collections.map(collection=>{
        return (collectionOption(collection))
    });

    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
                <h2 className='mb32'>NFT<br />Collection</h2>
                <button type='button' onClick={handleNext}>Next</button>
            </div>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            NFT Collection
                            <SelectMenu selected={selected} options={options} select={(a)=>handleSelect(a)} title="Select a collection" />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default CollectionPage;