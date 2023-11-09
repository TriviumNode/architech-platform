import { Collection } from "@architech/types";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import PlaceholdImg from "../../../Components/PlaceholdImg";
import TraitCard from "../../../Components/TraitCard/TraitCard";
import { getCollectionName } from "../../../Utils/helpers";

import styles from '../create.module.scss'
import { NftDetailState } from "./NftDetailPage";

const ReviewNftPage: FC<{
    // onChange: (data: FinishState)=>void;
    details: NftDetailState;
    collection: Collection | undefined;
    onClick: (e: any)=>any;
}> = ({ onClick, details, collection}): ReactElement => {
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Review<br />NFT</h2>
            <NftPreviewCard collectionName={getCollectionName(collection as Collection)} details={details}  />
            <form className={styles.form} onSubmit={()=>{}}>
                <div className='d-flex flex-column mb24 align-items-center mt16'>
                    <Col xs='auto'>
                        <button type='button' onClick={onClick}>Create NFT</button>
                    </Col>
                </div>
            </form>
        </div>
    )
}


export function NftPreviewCard(
    {
        details,
        collectionName
    }:{
        details: NftDetailState;
        collectionName: string;
    }
) {
    return (<div className={styles.nftPreviewCard}>
            <div className='d-flex gap16'>
                <Col xs={'3'} className='br8 square'>
                    <PlaceholdImg src={details.preview} className='wide tall imgCover square' />
                </Col>
                <Col className='d-flex flex-column'>
                    <div className='mb8'>
                        <h2>{details.name}</h2>
                        <div style={{marginLeft: '4px'}} className='lightText12'>
                            {!isNaN(parseInt(details.tokenId || '1')) ? '#' : 'ID '}{details.tokenId || 1} in collection <span style={{color: '#222'}}>{collectionName}</span>
                        </div>
                        {!!details.description && <p className='ml16 mt8 mb8'>{details.description}</p>}
                    </div>

                    {!!details.attributes.filter(a => !!a.trait_type && !!a.value).length &&
                        <>
                            <div className='lightText16 mb8'>Traits</div>
                            <div className='d-flex flex-wrap gap8 ml8'>
                                {details.attributes.filter(a => !!a.trait_type && !!a.value).map((a, i) => <TraitCard type={a.trait_type} value={a.value} key={i} />)}
                            </div>
                        </>
                    }
                </Col>
            </div>
            

        </div>);
}
  export default ReviewNftPage;