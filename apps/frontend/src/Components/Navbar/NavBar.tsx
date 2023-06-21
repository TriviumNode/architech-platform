import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import ArchDenom from "../ArchDenom";
import ProfileMenu from "../HoverMenu";
import SmallLoader from "../SmallLoader";
import Vr from "../vr";
import { useLocation } from 'react-router-dom'

import  styles from './Navbar.module.scss';

type HeaderPage = 'NFTS' | 'DAOS' | 'HOME';

const Navbar = () => {
  const {user, balances, connectKeplr, loadingConnectWallet} = useUser()
  const location = useLocation();
  console.log(location.pathname);

  const page: HeaderPage =
    location.pathname.toLowerCase().includes('nfts') ? 'NFTS' :
    location.pathname.toLowerCase().includes('daos') ? 'DAOS' :
    'HOME';

  const handleConnect = async (e: any) => {
    e.preventDefault();
    if (!connectKeplr) throw new Error("wot")
    await connectKeplr()
  }

    return (
      <nav id="navBar"  className={styles.navbar}>
        <div className={styles.navbarInternal}>
          <Link to="/" className={styles.logoLink}><img src='/logo.svg' alt="Architech"/></Link>
          <Link to={`nfts`} className={page === 'NFTS' ? styles.activeLink : undefined }>NFTs</Link>

          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search"
              placeholder="🔍 Search"
              type="search"
              name="q"
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            />
          </form>
          <div style={{width: 'auto', height: '100%'}}>
          { !!user ? 
            <ProfileMenu content={
              <div className='d-flex align-items-stretch' style={{color: "white", columnGap: '24px'}}>
                <div className='d-flex align-items-center'>{balances?.arch || <SmallLoader />}&nbsp;<ArchDenom /></div>
                <Vr color='#666666' />
                <div className='d-flex align-items-center' style={{fontSize: '12px'}}>{balances?.credits === undefined ? <SmallLoader /> : balances.credits}&nbsp;Credits</div>
              </div>
            } />
          :
            <button onClick={handleConnect} disabled={loadingConnectWallet}>Connect Wallet</button>
          }
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;