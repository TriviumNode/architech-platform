import { denomToHuman, findDenom, findToken, resolveIpfs } from "@architech/lib"
import { Denom, GetLatestListingsResponse } from "@architech/types"
import { FC, ReactElement } from "react"
import { Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getCollectionName } from "../../Utils/helpers"
import { DenomImg } from "../ArchDenom"

const ListingRow: FC<
    {
        result: GetLatestListingsResponse
    }
    > = ({result}): ReactElement => {
    
    let denom = findDenom(process.env.REACT_APP_NETWORK_DENOM) as Denom // This should always work
    let unknown = false;
    if (result.ask.cw20_contract) {
        const findDenom = findToken(result.ask.cw20_contract);
        denom = findDenom ||
            {
                decimals: 6, // TODO query from chain or reject entirely somewhere
                displayDenom: '????',
                image: 'alert.svg',
                cw20Contract: result.ask.cw20_contract,
            };

        if (!findDenom) {
            unknown = true;
        }
    }

    const humanAmount = denomToHuman(result.ask.price, denom.decimals);
    const collectionName = getCollectionName(result.collection)
    const tokenName = result.token.metadataExtension?.name || isNaN(result.token.tokenId as any) ? result.token.tokenId : `#${result.token.tokenId}`
    return(
    <Link to={`/nfts/${result.ask.collection}/${result.ask.token_id}`}
        style={{
            display: 'flex',
        }}
        className='wide'
    >
        <Col>
            <div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                <img
                    alt=''
                    src={resolveIpfs(result.token.metadataExtension?.image || '')}
                    style={{
                        height: '48px',
                        width: '48px',
                        borderRadius: '16px',
                        marginRight: '16px',
                    }}
                    className='coverImg'
                />
                <div className='d-flex flex-column justify-content-around' style={{overflow: "hidden"}}>
                    <div className='oneLineLimit'>{collectionName}</div>
                    <div className='lightText12 twoLineLimit'>{tokenName}</div>
                </div>
            </div>
        </Col>
        <Col xs={'auto'} className='d-flex flex-column justify-content-center' style={{textAlign: 'right'}}>
            <span>{parseFloat(humanAmount.toFixed(2)).toLocaleString()}<DenomImg className='ml8' denom={denom} /></span>
        </Col>
    </Link>
    )
}

export default ListingRow;