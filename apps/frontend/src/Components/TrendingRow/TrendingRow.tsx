import { denomToHuman, findFloor } from "@architech/lib"
import { TrendingCollectionResult } from "@architech/types"
import millify from "millify"
import { FC, ReactElement } from "react"
import { Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getApiUrl } from "../../Utils/backend"
import { getCollectionName } from "../../Utils/helpers"
import ArchDenom from "../ArchDenom"
import PlaceholdImg from "../PlaceholdImg"

const TrendingRow: FC<
    {
        result: TrendingCollectionResult
    }
    > = ({result}): ReactElement => {

    // const floor = millify(findFloor(result.asks, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)));
    const floor = millify(denomToHuman(result.floor, parseInt(process.env.REACT_APP_NETWORK_DECIMALS)));
    const volume = millify(parseInt(result.volume.find(v=>v.denom === process.env.REACT_APP_NETWORK_DENOM)?.amount || '0'));
    const humanVolume = denomToHuman(volume, parseInt(process.env.REACT_APP_NETWORK_DECIMALS))
    const collectionName = getCollectionName(result.collection)

    const imgUrl = result.collection.collectionProfile.profile_image ? getApiUrl(`/public/${result.collection.collectionProfile.profile_image}`) : undefined;
    return(
    <Link to={`/nfts/${result.collection.address}`}
        style={{
            display: 'flex',
            gap: '16px'
        }}
        className='wide'
    >
        <Col xs={true}>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                <PlaceholdImg
                    alt=''
                    src={imgUrl}
                    style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '16px',
                        marginRight: '16px',
                    }}
                    className='coverImg'
                />
                <div style={{overflow: "hidden"}}>
                    <div className='oneLineLimit'>{collectionName}</div>
                    <div className='lightText11 twoLineLimit'>{result.collection.collectionProfile.description}</div>
                </div>
            </div>
        </Col>
        <Col xs={'auto'} className='d-flex flex-column justify-content-center' style={{textAlign: 'center'}}>
            <span>{floor || '--'}&nbsp;<ArchDenom /></span>
        </Col>
        <Col xs={'auto'} className='d-flex flex-column justify-content-center' style={{textAlign: 'center'}}>
            <span>{humanVolume ? parseFloat(humanVolume.toFixed(2)) : '--'}&nbsp;<ArchDenom /></span>
        </Col>
    </Link>
    )
}

export default TrendingRow;