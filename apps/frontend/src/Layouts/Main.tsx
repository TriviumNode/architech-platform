import { CREDIT_ADDRESS, MARKETPLACE_ADDRESS } from "@architech/lib";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar, { BurgerMenu, HeaderPage } from "../Components/Navbar/NavBar";
import { useUser } from "../Contexts/UserContext";
import styles from './Main.module.scss'

export default function MainLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollbarWidth = window.innerWidth - document.body.clientWidth

  useEffect(()=>{
    document.body.style.setProperty("--scrollbarWidth", `${scrollbarWidth}px`)
    document.body.style.setProperty('--viewportWidth', `calc(100vw - ${scrollbarWidth}px)`);
  },[scrollbarWidth])

  const page: HeaderPage =
    location.pathname.toLowerCase().includes('nfts') ? 'NFTS' :
    location.pathname.toLowerCase().includes('daos') ? 'DAOS' :
    'HOME';
  return (
  <>
    <BurgerMenu page={page} open={menuOpen} handleClose={()=>setMenuOpen(false)} />
    <Container fluid style={{
      padding: '0',
    }}>

      <header>
        <Navbar openMenu={()=>setMenuOpen(true)} />
        <div className='lightText10 d-flex justify-content-between flex-wrap' style={{overflow: "hidden"}}>
          <div>Testnet Mode: {process.env.REACT_APP_CHAIN_ID} {process.env.REACT_APP_RPC_URL}</div>
          <div>Marketplace: {MARKETPLACE_ADDRESS}</div>
          <div>Credits: {CREDIT_ADDRESS}</div>
        </div>
      </header>
      {/* <div id="detail"> */}
          <Outlet />
      {/* </div> */}
      <footer className={styles.footer}>
        {/* <div style={{display: 'flex', alignItems: 'center'}}> */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            <img src='/logo.svg' style={{maxHeight: '1em', marginRight: '0.5em'}} />
            <h2>Architech</h2>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
            <p>© Architech 2023</p>
            <Row>
              <Col>
                <a target='_blank' rel='noreferrer' href='https://twitter.com/Architech_Build'><img src="/twitter.svg" alt='Twitter' /></a>
              </Col>

              <Col>
                <a target='_blank' rel='noreferrer' href='https://discord.gg/56Kn4DQc5P'><img src="/discord.svg" alt='Discord' /></a>
              </Col>
              {/* <Col>
                <a target='_blank' rel='noreferrer' href='#'><img src="/telegram.svg" alt='Telegram' /></a>
              </Col> */}
              <Col>
                <a target='_blank' rel='noreferrer' href='https://github.com/triviumnode'><img src="/github.svg" alt='Github' /></a>
              </Col>
            </Row>
          </div>
        {/* </div> */}
      </footer>
    </Container>

    </>
  );
}