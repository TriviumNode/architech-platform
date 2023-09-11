import {ReactElement, FC, useState} from "react";
import { Col } from "react-bootstrap";
import { useUser } from "../../Contexts/UserContext";

import styles from './create.module.scss'
import ConnectWallet from "../../Components/ConnectWallet";
import AdminTasksPage from "./TasksPage";
import { ADMINS } from "@architech/lib";
import AdminRewardsPage from "./RewardsPage";
import AdminMinterQueries from "./MinterQueries";
import AdminNoisStatusPage from "./NoisStatusPage";

export type Page = 'Maintenance Tasks' | 'Rewards' | 'Minter Queries' | 'NOIS Status'

export const Pages: Page[] = [
    'Rewards',
    'NOIS Status',
    'Minter Queries',
    'Maintenance Tasks',
]

const AdminDashboard: FC<any> = (): ReactElement => {
    const { user } = useUser();
    const [error, setError] = useState<string>()
    const [page, setPage] = useState<Page>(Pages[0])

    const getPage = () => {
        switch(page) {
            case 'Rewards':
                return <AdminRewardsPage />
            case 'Minter Queries':
                return <AdminMinterQueries />
            case 'Maintenance Tasks':
                return <AdminTasksPage />
              case 'NOIS Status':
                return <AdminNoisStatusPage />
            default:
                return <div style={{margin: '32px', textAlign: 'center'}}><h2 style={{color: 'red'}}>Something went wrong</h2><p>The application encounted an error: `Tried to navigate to undefined page.`<br />Please try to navigate to another page using the menu on the left.</p></div>
        }
    }

    if (!user)
        return (<ConnectWallet />)

    if (!ADMINS.includes(user.address))
        return (
            <div className='d-flex mt32 justify-content-center' style={{padding: '64px 0'}}>
                <h1>Unauthorized</h1>
            </div>
        )

    return (<>
        <div className={styles.mainRow}>
            <Col xs={12} md={4} className={styles.navCard}>
                <div className={styles.navCardInner}>
                    <h2>Admin<br/>Dashboard</h2>
                    <div className={styles.navLinks}>
                        { Pages.map((p: Page)=>
                            <button type='button' onClick={()=>{setPage(p)}} disabled={page === p} key={p}>
                                {p}
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

export default AdminDashboard;