import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar/NavBar";
import { useUser } from "../Contexts/UserContext";
import styles from './Main.module.scss'

export default function MainLayout() {

  return (
    <>
    <Container fluid style={{
      // maxWidth: '1440px',
      // margin: 'auto',
    }}>
      <header>
        <Navbar />
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
                <a target='_blank' rel='noreferrer' href='https://twitter.com/triviumnode'><img src="/twitter.svg" alt='Twitter' /></a>
              </Col>

              <Col>
                <a target='_blank' rel='noreferrer' href='https://discord.gg/56Kn4DQc5P'><img src="/discord.svg" alt='Discord' /></a>
              </Col>
              <Col>
                <a target='_blank' rel='noreferrer' href='#'><img src="/telegram.svg" alt='Telegram' /></a>
              </Col>
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