import { Collection, Token } from "@architech/types"
import { FC, ReactElement } from "react"
import { Col, Row } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import ArchDenom from "../ArchDenom"
import LinkButton from "../LinkButton"

import styles from './CreateTile.module.scss'

const CreateTile: FC<{}> = (): ReactElement => {
  return (
      <div className={styles.createCard}>
        <div className={styles.createInner}>
          <h2 className='h25'>Create<br/>your own<br/>collection</h2>
          <p>Create your own NFT collection now</p>  
          <LinkButton to='/nfts/createcollection'>Create</LinkButton>
        </div>
      </div>
  )
}

export default CreateTile;