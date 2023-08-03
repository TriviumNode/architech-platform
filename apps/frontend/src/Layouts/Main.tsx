import { Block } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { Col, Row, ToastContainer } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import { Link, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar, { BurgerMenu, HeaderPage } from "../Components/Navbar/NavBar";
import { MintProvider } from "../Contexts/MintContext";
import { useUser } from "../Contexts/UserContext";
import { CREDIT_ADDRESS, initClients, MARKETPLACE_ADDRESS, QueryClient } from "../Utils/queryClient";
import styles from './Main.module.scss'

export default function MainLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const [latestBlockTime, setLatestBlockTime] = useState<Date>()

  const scrollbarWidth = window.innerWidth - document.body.clientWidth

  useEffect(()=>{
    document.body.style.setProperty("--scrollbarWidth", `${scrollbarWidth}px`)
    document.body.style.setProperty('--viewportWidth', `calc(100vw - ${scrollbarWidth}px)`);
  },[scrollbarWidth])

  const getBlockTime = async() => {
    QueryClient.getBlock().then((block: Block)=>setLatestBlockTime(new Date(block.header.time))).catch((a)=>{})
  }

  useEffect(()=>{
    if (process.env.REACT_APP_CHAIN_ID.startsWith('archway-')) return;
    getBlockTime();
  },[QueryClient])

  const page: HeaderPage =
    location.pathname.toLowerCase().includes('nfts') ? 'NFTS' :
    location.pathname.toLowerCase().includes('daos') ? 'DAOS' :
    'HOME';
  return (
  <MintProvider>
    
    <BurgerMenu page={page} open={menuOpen} handleClose={()=>setMenuOpen(false)} />
    <Container fluid style={{
      padding: '0',
    }}>

      <header>
        <Navbar openMenu={()=>setMenuOpen(true)} />
        { !process.env.REACT_APP_CHAIN_ID.startsWith('archway-') &&
          <div className='lightText10 d-flex flex-wrap card mb8 align-items-center justify-content-between mb8' style={{overflow: "hidden", minHeight: '48px', background: 'orange', padding: '0 16px'}}>
            <div className='d-flex'>
              <h3 style={{color: '#222'}}>Testnet Mode  </h3>
              <div className='ml16'>
                <div>{process.env.REACT_APP_CHAIN_ID}</div>
                <div>{process.env.REACT_APP_RPC_URL}</div>
              </div>
            </div>

            <div>Block Tme: {latestBlockTime?.toLocaleString()}</div>
            <div>
              <div>Marketplace: {MARKETPLACE_ADDRESS}</div>
              <div>Credits: {CREDIT_ADDRESS}  </div>
            </div>
          </div>
        }
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

    </MintProvider>
  );
}