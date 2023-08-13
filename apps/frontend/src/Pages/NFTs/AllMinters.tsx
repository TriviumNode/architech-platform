import { Collection, GetCollectionResponse } from "@architech/types";
import React, {ReactElement, FC, useState} from "react";
import { Row, Col } from "react-bootstrap";
import { useLoaderData, useRevalidator } from "react-router-dom";
import FeaturedCarousel from "./Featured";
import { CollectionsDisplay } from "./NFTs";

import styles from './AllMinters.module.scss'
import { toast } from "react-toastify";
import { getEndedMinters } from "../../Utils/backend";

type Page = 'ACTIVE' | 'ENDED'

const AllMinters: FC<any> = (): ReactElement => {
  const { collections: minterCollections } = useLoaderData() as { collections: GetCollectionResponse[]};
  const revalidator = useRevalidator();

  const [page, setPage] = useState<Page>('ACTIVE')
  const [ended, setEnded] = useState<GetCollectionResponse[]>()

  const display = page === 'ACTIVE' ? minterCollections : ended

  const getEnded = async() => {
    try {
      const results = await getEndedMinters();
      setEnded(results)
    } catch(err: any) {
      toast.error('Failed to fetch ended collections')
      console.error('Failed to fetch ended collections:', err)
    }
  }

  const handleClick = (e: any) => {
    const page = e.target.id
    setPage(page)
    if (page === 'ENDED'){
      setEnded(undefined);
      getEnded();
    } else {
      revalidator.revalidate()
    }
  }

  return (
    <>
      <FeaturedCarousel />

      {/* Trending Row */}
      <div className={`wide mb8 d-flex align-items-center`} style={{height: '64px'}}>
          <h2 style={{margin: '0 24px'}}>Drops</h2>
          <div className={styles.selectContainer}>
            <button id='ACTIVE' onClick={handleClick} className={page === 'ACTIVE' ? styles.active : undefined} disabled={page === 'ACTIVE'}>
              Active and Upcoming
            </button>
            <button id='ENDED' onClick={handleClick} className={page === 'ENDED' ? styles.active : undefined} disabled={page === 'ENDED'}>
              Ended
            </button>
          </div>
      </div>
      <CollectionsDisplay collections={display} displayCreateTile={false} />
    </>
  );
};

export default AllMinters;