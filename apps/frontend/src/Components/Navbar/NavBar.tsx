import { Link } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import ArchDenom from "../ArchDenom";
import ProfileMenu from "../HoverMenu";
import Loader from "../Loader";
import SmallLoader from "../SmallLoader/Loader";
import Vr from "../vr";

import  styles from './Navbar.module.scss';

const Navbar = () => {
  const {user, balances, connectKeplr, loadingConnectWallet} = useUser()

  const handleConnect = async (e: any) => {
    e.preventDefault();
    if (!connectKeplr) throw new Error("wot")
    await connectKeplr()
  }

    return (
      <nav id="navBar"  className={styles.navbar}>
        <div className={styles.navbarInternal}>
          <Link to="/" className={styles.logoLink}><img src='/logo.svg' alt="Architech"/></Link>
          <Link to={`/`}>Home</Link>
          <Link to={`collections`}>Collections</Link>

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
              <div className='d-flex align-items-center' style={{color: "white", columnGap: '24px'}}>
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