import { denomToHuman, findFloor } from "@architech/lib"
import { TrendingCollectionResult } from "@architech/types"
import { FC, ReactElement } from "react"
import { Row, Col } from "react-bootstrap"
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
    <Row style={{width: '100%'}}>
        <Col xs={8}>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                <img
                    alt={collectionName}
                    src={getApiUrl(`/public/${result.collection.collectionProfile.profile_image}`)}
                    style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '16px',
                        marginRight: '16px',
                    }}
                />
                <div>
                    <span>{collectionName}</span><br />
                    <span>{result.collection.collectionProfile.description}</span>
                </div>
            </div>
            {/* </Row> */}
        </Col>
        <Col xs={2}>
            <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                }}>{floor ? floor.toFixed(2) : '--'}&nbsp;<ArchDenom /></span>
            </Row>
        </Col>
        <Col xs={2}>
            <Row style={{justifyContent: "center", alignItems: "center", height: '100%'}}>
                <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                }}>{humanVolume ? humanVolume.toFixed(2) : '--'}&nbsp;<ArchDenom /></span>
            </Row>
        </Col>
    </Row>
    )
}

export default TrendingRow;