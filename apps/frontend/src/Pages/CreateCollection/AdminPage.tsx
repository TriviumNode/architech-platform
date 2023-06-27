import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../Components/MultiSelect";

import styles from './create.module.scss'

export interface AdminState {
    address: string,
}

export const DefaultAdminState: AdminState = {
    address: '',
}

const AdminPage: FC<{
    data: AdminState,
    onChange: (data: AdminState)=>void;
}> = ({data, onChange}): ReactElement => {

    const updateState = (newState: Partial<AdminState>) => {
        onChange({...data, ...newState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <h2 className='mb32'>Contract<br />Admin</h2>
            <form className={styles.form}>
                <div className='d-flex mb24'>
                    <Col xs={8}>
                        <label>
                            Contract Admin Address
                            <input placeholder='archway1a2b...' />
                        </label>
                    </Col>
                    <Col xs={4}>
                        <label>
                            Customize Admin
                            <div className='d-flex flex-column wide'>
                                <input type='checkbox' />
                            </div>
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default AdminPage;