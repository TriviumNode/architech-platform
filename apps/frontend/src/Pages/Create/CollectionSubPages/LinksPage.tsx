import { CATEGORIES } from "@architech/lib";
import { FC, ReactElement } from "react";
import { Col } from "react-bootstrap";
import MultiSelect from "../../../Components/MultiSelect";

import styles from '../create.module.scss'

export interface LinkState {
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
}

export const DefaultLinksState: LinkState = {
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
}

const LinksPage: FC<{
    state: LinkState,
    onChange: (newState: LinkState)=>void;
    next?: ()=>void;
}> = ({state, onChange, next}): ReactElement => {

    const updateDetailState = (newDetailState: Partial<LinkState>) => {
        onChange({...state, ...newDetailState})
    }
    return (
        <div style={{margin: '48px'}} className='d-flex flex-column'>
            <div className='d-flex' style={{justifyContent: 'space-between'}}>
              <h2 className='mb32'>Collection<br />Links</h2>
              { !!next && <button type='button' onClick={()=>next()}>Next</button> }
            </div>
            <form className={styles.form}>
            <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Website
                            <input placeholder='https://your-website.com' value={state.website} onChange={(e)=>updateDetailState({website: e.target.value})} />
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Twitter
                            <input placeholder='@YourTwitterHandle' value={state.twitter} onChange={(e)=>updateDetailState({twitter: e.target.value})} />
                        </label>
                    </Col>
                </div>
                <div className='d-flex mb24'>
                    <Col>
                        <label>
                            Discord
                            <input placeholder='https://discord.com/your-invite' value={state.discord} onChange={(e)=>updateDetailState({discord: e.target.value})} />
                        </label>
                    </Col>
                    <Col>
                        <label>
                            Telegram
                            <input placeholder='https://t.me/your-room' value={state.telegram} onChange={(e)=>updateDetailState({telegram: e.target.value})} />
                        </label>
                    </Col>
                </div>
            </form>
        </div>
    )
}

export default LinksPage;