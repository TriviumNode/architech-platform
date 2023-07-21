import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import ArchDenom from "../ArchDenom";
import ProfileMenu from "../HoverMenu";
import SmallLoader from "../SmallLoader";
import Vr from "../vr";
import { useLocation } from 'react-router-dom'

import  styles from './Navbar.module.scss';
import { truncateAddress } from "@architech/lib";
import SearchBar from "../SearchBar/SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHamburger, faMagnifyingGlass, faWallet, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


export type HeaderPage = 'NFTS' | 'DAOS' | 'HOME';


export const BurgerMenu = ({page, open, handleClose}:{page: HeaderPage, open: boolean, handleClose: ()=>any}) => {
  const { user, balances } = useUser()

  const handleClick = (e: any)=>{
    handleClose()
  }

  return (
    <div
      // isOpen={ open }
      // noOverlay={true}
      // width={'100vw'}
      // menuClassName={styles.burgerMenu}
      // burgerButtonClassName="d-none"
      // customBurgerIcon={ false }
      // customCrossIcon={ false }
      className={`${styles.menuNav} ${open ? styles.showMenu : ''}`}
    >
      <div className='d-flex justify-content-between'>
        <Link onClick={()=>handleClose()} to="/" className={`${styles.logoLink} mb8`}><img src='/logo.svg' alt="Architech"/><h2 className='d-inline ml8'>Architech</h2></Link>
        <button type='button' onClick={()=>handleClose()}><FontAwesomeIcon size='2x' icon={faXmark} /></button>
      </div>
      
      {!!user &&
        <div className='mb8 ml16' style={{width: 'fit-content'}}>
          <span>{truncateAddress(user.profile.display_name, process.env.REACT_APP_NETWORK_PREFIX)}</span>
          <div className='d-flex justify-content-between'>
                      <div style={{fontSize: '12px'}} className='d-flex align-items-center'>{balances?.arch ? balances.arch.toFixed(3) : <SmallLoader />}&nbsp;<ArchDenom /></div>
                      <div style={{fontSize: '12px'}} className='d-flex align-items-center'>{balances?.credits === undefined ? <SmallLoader /> : balances.credits}&nbsp;Credits</div>
                    </div>
        </div>
      }
      <div className={`ml8 mt16 ${styles.mobileLinks}`}>
        <Link onClick={()=>handleClose()} to={`nfts`}>NFTs</Link>
        { !!user &&
        <>
          <Link onClick={()=>handleClose()} to={`/profile/${user.address}`}>My Profile</Link>
          <Link onClick={()=>handleClose()} to={`/nfts/createcollection`}>Create Collection</Link>
          <Link onClick={()=>handleClose()} to={`/nfts/create`}>Create NFT</Link>
          <Link onClick={()=>handleClose()} to={`/nfts/import`}>Import Collection</Link>
        </>
        }
      </div>
    </div>
  );
}

const Navbar = ({openMenu}:{openMenu: ()=>any}) => {
  const {user, balances, connectWallet, walletStatus} = useUser()
  const location = useLocation();

  const page: HeaderPage =
    location.pathname.toLowerCase().includes('nfts') ? 'NFTS' :
    location.pathname.toLowerCase().includes('daos') ? 'DAOS' :
    'HOME';

  const handleConnect = async (e: any) => {
    e.preventDefault();
    if (!connectWallet) throw new Error("wot")
    connectWallet()
  }
  const handleWalletButton = async(e: any) => {
    e.preventDefault();
    if (!user) await connectWallet()
    else openMenu();
  }

    return (
      <>
      <nav id="navBar"  className={`${styles.navbar} grayCard`}>

        <div className={styles.navbarInternal}>
          <div className='d-md-none d-flex wide tall align-items-center' style={{position: 'relative'}}>
            <button type='button' className='noButton' style={{color: '#777'}} onClick={()=>openMenu()}>
              <FontAwesomeIcon size='2x' icon={faBars} />
            </button>
            <div style={{position: "absolute", top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center'}}>
              <img alt='Architech' src='/logo.svg' />
              <h5 className='ml8' style={{fontSize: '18px', fontWeight: '400'}}>Beta</h5>
            </div>
            <button type='button' className='noButton' style={{color: '#777', marginLeft: 'auto'}}>
              <FontAwesomeIcon size='2x' icon={faMagnifyingGlass} />
            </button>
            <button type='button' className='noButton' style={{color: !!user ? '#0366fc' : '#777', margin: '0 16px'}} onClick={handleWalletButton}>
              <FontAwesomeIcon size='2x' icon={faWallet} />
            </button>
          </div>
            <Link to="/" className={`${styles.logoLink} d-none d-md-flex align-items-center`} style={{color: '#666 !important'}}><img src='/logo.svg' alt="Architech"/><h5 className='ml8' style={{fontSize: '18px', fontWeight: '400'}}>Beta</h5></Link>
            <Link to={`nfts`} className={`${page === 'NFTS' ? styles.activeLink : undefined} d-none d-md-flex`}>NFTs</Link>
            <SearchBar style={{marginLeft: 'auto'}} className='d-none d-md-block' />
            <div style={{width: 'auto', height: '100%'}} className='d-none d-md-block'>
            { !!user ? 
              <ProfileMenu content={
                <div className='d-flex align-items-stretch' style={{color: "white", columnGap: '24px'}}>
                  {/* <div className='d-flex align-items-center'>{balances?.arch ? parseFloat(balances.arch.toFixed(4)) : <SmallLoader />}&nbsp;<ArchDenom /></div>
                  <Vr color='#666666' />
                  <div className='d-flex align-items-center' style={{fontSize: '12px'}}>{balances?.credits === undefined ? <SmallLoader /> : balances.credits}&nbsp;Credits</div> */}
                  <div>
                    <span>{truncateAddress(user.profile.display_name, process.env.REACT_APP_NETWORK_PREFIX)}</span><br />
                    <div className='d-flex justify-content-between'>
                      <div style={{fontSize: '12px'}} className='d-flex align-items-center mr16'>{balances?.arch ? balances.arch.toFixed(3) : <SmallLoader />}&nbsp;<ArchDenom /></div>
                      <div style={{fontSize: '12px'}} className='d-flex align-items-center'>{balances?.credits === undefined ? <SmallLoader /> : balances.credits}&nbsp;Credits</div>
                    </div>
                  </div>
                </div>
              } />
            :
              <button onClick={handleConnect} disabled={walletStatus !== 'DISCONNECTED'} className={styles.walletButton}>Connect Wallet</button>
            }
          </div>
        </div>
      </nav></>
    );
  };
  
  export default Navbar;