import {ReactElement, FC, useState, useEffect} from "react";
import { Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import styles from './create.module.scss'

export interface Page {
    title: string;
    link: string;
    content: ReactElement;
}

interface Props {
    title: ReactElement;
    pages: Page[];
    backButton?: boolean;
    page: Page;
    onChange: (page: Page)=>void;
}

const errorPage = (<div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>)

const SubPages: FC<Props> = ({pages, page, title, backButton, onChange}): ReactElement => {
    const navigate = useNavigate();

    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <div className='d-flex align-items-center'>
                        {!!backButton && <button className='clearBtn' style={{padding: '0'}} onClick={()=>navigate(-1)} ><img alt='Back' src='/arrow-left.svg' /></button> }
                        <h2 className='d-inline-block ml16'>{title}</h2>
                    </div>
                    <div className={styles.navLinks}>
                        { pages.map((p: Page)=>
                            <button type='button' onClick={()=>{onChange(p)}} disabled={page === p} key={p.title}>
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
                {page.content}
            </Col>
        </div>
    </>);
};

export default SubPages;