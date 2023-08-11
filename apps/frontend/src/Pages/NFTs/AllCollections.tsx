import { Collection, GetCollectionResponse } from "@architech/types";
import React, {ReactElement, FC} from "react";
import { Row, Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import FeaturedCarousel from "./Featured";
import { CollectionsDisplay } from "./NFTs";

import styles from './NFTs.module.scss'

const AllCollections: FC<any> = (): ReactElement => {
  const { collections } = useLoaderData() as { collections: GetCollectionResponse[]};
  return (
    <>
      <FeaturedCarousel />

      {/* Trending Row */}
      <div className={`grayCard wide mb8 d-flex align-items-center`} style={{height: '64px'}}>
          <h2 style={{marginLeft: '24px'}}>Collections</h2>
      </div>
      <CollectionsDisplay collections={collections} displayCreateTile={true} />
    </>
  );
};

export default AllCollections;