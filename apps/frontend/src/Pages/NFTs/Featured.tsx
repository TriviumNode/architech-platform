import {ReactElement, FC, useState, useEffect} from "react";
import { getApiUrl, getFeaturedCollections } from "../../Utils/backend";
import { GetTrendingCollectionResponse } from '@architech/types'

import { getCollectionName } from "../../Utils/helpers";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import styles from './NFTs.module.scss';
import ArchDenom, { DenomImg } from "../../Components/ArchDenom";
import { denomToHuman, findDenom, findFloor } from "@architech/lib";
import { calculatePrices } from "../../Utils/data";
import { Link } from "react-router-dom";

const FeaturedCarousel: FC<any> = (): ReactElement => {
  const [featured, setFeatured] = useState<GetTrendingCollectionResponse>();
  const [loading, setLoading] = useState(true);

  const GetFeatured = async () => {
      setLoading(true);
      try {
          const result = await getFeaturedCollections();
          setFeatured(result);
      } catch(err: any) {
          console.error('Error getting featured collections:', err.toString(), err)
      }
      setLoading(false);
  }
  
  useEffect(()=>{
    GetFeatured();
  },[])

  if (!featured?.length) return <></>

  const items = featured.map((f,i)=>{
    const collectionName = getCollectionName(f.collection);
    const floor = findFloor(f.asks, parseInt(process.env.REACT_APP_NETWORK_DECIMALS));

    const classNames = (()=>{
      if (featured.length === 1) return '';
      if (i === 0) return 'pr4'
      if (i === featured.length-1) return 'pl4'
      return 'pl4 pr4'
    })()

    // let row2 = <>Floor&nbsp;&nbsp;&nbsp;&nbsp;{floor || '--'}&nbsp;<ArchDenom /></>
    let row2 = (
      <div className='wide d-flex justify-content-between'>
        <div>Floor</div>
        <div className='d-flex align-items-center'>{floor || '--'}&nbsp;<ArchDenom /></div>
      </div>
    );
    let link = `/nfts/${f.collection.address}`
    if (f.collection.collectionMinter) {
      const launch_time = f.collection.collectionMinter.launch_time ? new Date(parseInt(f.collection.collectionMinter.launch_time) * 1000) : undefined;
      const end_time = f.collection.collectionMinter.end_time ? new Date(parseInt(f.collection.collectionMinter.end_time) * 1000) : undefined;

      // Check if Minting is Open or in Future
      if (
          // No end time
          !end_time ||
          // Or end time if in future
          end_time.valueOf() > new Date().valueOf()
        )
      {
        link = `/nfts/mint/${f.collection.address}`
        const text = (launch_time && launch_time.valueOf() > new Date().valueOf()) ?
          `Minting ${launch_time.toLocaleDateString()}`
        :
          'Minting Now'
        if (f.collection.collectionMinter.payment){
          const denom = findDenom((f.collection.collectionMinter.payment.denom || f.collection.collectionMinter.payment.token) as string);
          const humanPrice = denomToHuman(f.collection.collectionMinter.payment.amount, denom.decimals)
          // row2 = <>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{humanPrice}&nbsp;<DenomImg denom={denom}/></>
          row2 = (
            <div className='wide d-flex justify-content-between'>
              <div>{text}</div>
              <div className='d-flex align-items-center'>{humanPrice}&nbsp;<DenomImg denom={denom} /></div>
            </div>
          );
        } else 
          // row2 = <>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Free&nbsp;<ArchDenom /></>
          row2 = (
            <div className='wide d-flex justify-content-between'>
              <div>{text}</div>
              <div className='d-flex align-items-center'>Free&nbsp;<ArchDenom /></div>
            </div>
          );
      } else if (
        // Launch time
        launch_time &&
        // Launch time is in future
        launch_time.valueOf() > new Date().valueOf()
      ) {

      }
    }

    return (
      <div className={classNames}>
      <Link to={link} key={i}>
      <div key={i} style={{height: '500px', textAlign: 'left'}} className='br8'>
        <img
          alt={collectionName}
          className='wide tall imgCover'
          src={f.collection.collectionProfile?.profile_image ? getApiUrl(`/public/${f.collection.collectionProfile.profile_image}`) : '/placeholder.png'}
        />
          <div className={styles.overlay}>
            <div style={{width: 'fit-content'}}>
              {/* <h6 className='lightText10' style={{textTransform: 'uppercase', fontWeight: '800'}}>Featured</h6> */}
              <h2 style={{marginTop: 0}}>{collectionName}</h2>
              <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                  {row2}
              </div>
            </div>
          </div>  
      </div>
      </Link>
      </div>
    )
  })

  return (
    <Carousel
      autoPlay={false}
      centerMode
      centerSlidePercentage={items.length > 1 ? 50 : 100}
      dynamicHeight
      showThumbs={false}  
      showStatus={false}
      showIndicators={false}
      className='mb8'
    >
      {items}
    </Carousel>
  );
};

export default FeaturedCarousel;