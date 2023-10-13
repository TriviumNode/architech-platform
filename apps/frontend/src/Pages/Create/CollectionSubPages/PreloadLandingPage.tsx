import { Collection } from "@architech/types";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";

import styles from '../create.module.scss'

const PreloadLandingPage: FC<{
  setCsvPage: ()=>void;
  setJsonPage: ()=>void;
  collection: Collection;
}> = ({setCsvPage, setJsonPage, collection}): ReactElement => {
  if (!collection.collectionMinter) return (
    <div className='d-flex mt16 mb16 justify-content-center'>
      <h2>This collection is not a minter.</h2>
    </div>
  )
  return (
    <div style={{margin: '48px', height: 'calc(100% - 48px - 48px)'}} className='d-flex flex-column'>
      <div className='d-flex' style={{justifyContent: 'space-between'}}>
        <h2 className='mb32'>Preload<br />Minter</h2>
      </div>
      
      <div className={styles.selectTypeCard}  style={{flex: '1'}}>
        <div className={styles.inner} style={{height: ''}}>
          <div className={styles.buttonRow}>
            <Col>
              <button type='button' onClick={()=>setCsvPage()} >
                <h3>Preload with CSV</h3>
                <p className='lightText12'>
                  Upload a CSV file to preload your minter.
                </p>
              </button>
            </Col>
            <Col>
              <button type='button' onClick={()=>setJsonPage()} >
                <h3>Preload with JSON</h3>
                <p className='lightText12'>
                  Upload a JSON file to preload your minter.
                </p>
              </button>
            </Col>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreloadLandingPage;