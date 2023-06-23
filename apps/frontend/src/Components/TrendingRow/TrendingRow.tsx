import { denomToHuman, findFloor } from "@architech/lib"
import { TrendingCollectionResult } from "@architech/types"
import { FC, ReactElement } from "react"
import { Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import { getCollectionName } from "../../Utils/helpers"
import ArchDenom from "../ArchDenom"

const TrendingRow: FC<
    {
        result: TrendingCollectionResult
    }
    > = ({result}): ReactElement => {

    const floor = findFloor(result.asks, parseInt(process.env.REACT_APP_NETWORK_DECIMALS));
    const volume = result.volume.find(v=>v.denom === process.env.REACT_APP_NETWORK_DENOM)?.amount || '0';
    const humanVolume = denomToHuman(volume, parseInt(process.env.REACT_APP_NETWORK_DECIMALS))
    const collectionName = getCollectionName(result.collection)
    return(
    // <Row style={{width: '100%'}}>
    <Link to={`/nfts/${result.collection.address}`}
        style={{
            display: 'flex',
        }}
        className='wide'
    >
        <Col xs={8}>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                <img
                    alt=''
                    src={getApiUrl(`/public/${result.collection.collectionProfile.profile_image}`)}
                    style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '16px',
                        marginRight: '16px',
                    }}
                />
                <div style={{overflow: "hidden"}}>
                    <div className='oneLineLimit'>{collectionName}</div>
                    <div className='lightText11 twoLineLimit'>{result.collection.collectionProfile.description}</div>
                </div>
            </div>
            {/* </Row> */}
        </Col>
        <Col xs={2}>
            <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                }}>{floor ? parseFloat(floor.toFixed(2)) : '--'}&nbsp;<ArchDenom /></span>
            </Row>
        </Col>
        <Col xs={2}>
            <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                }}>{humanVolume ? parseFloat(humanVolume.toFixed(2)) : '--'}&nbsp;<ArchDenom /></span>
            </Row>
        </Col>
    </Link>
    // </Row>
    )
}

export default TrendingRow;