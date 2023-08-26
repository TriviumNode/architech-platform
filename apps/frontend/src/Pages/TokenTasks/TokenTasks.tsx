import {ReactElement, FC, useState} from "react";
import { Col } from "react-bootstrap";
import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";

import styles from './create.module.scss'
import { GetCollectionResponse, GetTokenResponse } from "@architech/types";
import ConnectWallet from "../../Components/ConnectWallet";

import TransferPage from "./Pages/TransferPage";
import { getCollectionName } from "../../Utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export type Page = {
  link: string;
  title: string;
}

export const PAGES: Page[] = [
  {
    link: 'transfer',
    title: 'Transfer',
  },
]
const Pages = PAGES;

const TokenTasks: FC<any> = (): ReactElement => {
  const { user: wallet, refreshProfile } = useUser();
  const { token: { token }, collection: fullCollection } = useLoaderData() as {collection: GetCollectionResponse, token: GetTokenResponse};
  const navigate = useNavigate();
  const params = useParams()

  const findPage = Pages.find(p=>p.link.toLowerCase() === params.page?.toLowerCase()) || Pages[0]

  const revalidator = useRevalidator();

  const [page, setPage] = useState<Page>(findPage)

  const num = isNaN(token.tokenId as any) ? null : '#'
  const nftName = !!token.metadataExtension?.name ? token.metadataExtension.name : `${num}${token?.tokenId}`

  const changePage = (newLink: string) => {
    setPage(Pages.find(p=>p.link===newLink) as Page);
  }

  const getPage = () => {
    switch(true) {
      case page.link==='transfer':
        return <TransferPage collectionAddress={fullCollection.collection.address} tokenId={token.tokenId} tokenName={nftName} />
      default:
        return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
    }
  }

  if (!wallet) return (
    <ConnectWallet text='Connect your wallet to manage this NFT' />
  )

  if (wallet.address !== token.owner) return (
    <div className='card d-flex align-items-center justify-content-center flex-column' style={{height: 'calc(100vh - 64px - 16px - 8px)'}}>
      <FontAwesomeIcon size='4x' icon={faCircleXmark} className='mb16' />
      <div style={{fontSize: '32px'}}>Access Denied</div>
      <div style={{fontSize: '24px'}}>You can't manage an NFT you don't own.</div>
    </div>
  )

  return (<>
    <div className={styles.mainRow}>
      <Col xs={12} md={4} className={styles.navCard}>
        <div className={styles.navCardInner}>
          <div className='d-flex align-items-center'>
            <button className='clearBtn' style={{padding: '0'}} onClick={()=>navigate(-1)} ><img alt='Back' src='/arrow-left.svg' /></button>
            <h2 className='d-inline-block ml16'>NFT<br/>Tasks</h2>
          </div>
          <div className='mb16' style={{color: '#121212'}}>
            <div style={{fontSize: '16px', fontWeight: '700'}}>{getCollectionName(token.collectionInfo)}</div>
            <div>{nftName}</div>
          </div>
          <div className={styles.navLinks}>
            { Pages.map((p: Page)=>
              <button type='button' onClick={()=>{setPage(p)}} disabled={page.link === p.link} key={p.link}>
                {p.title}
              </button>)
            }
          </div>
        </div>
      </Col>
      <Col
        xs={12}
        md={true} /* true fills remaining space without being wider than the header */
        className='card'
      >
        {getPage()}
      </Col>
    </div>
  </>);
};

export default TokenTasks;