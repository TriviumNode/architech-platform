import { Link } from "react-router-dom"

const HiddenBanner = ({page, collectionAddress}:{page: 'NFT' | 'COLLECTION' | 'MINTER', collectionAddress: string}) => {
  let text = 'Reveal it to list this NFT on Architech.'
  if (page === 'COLLECTION') text = 'Reveal it to list on Architech.'
  if (page === 'MINTER') text = 'Reveal it to list on Architech.'
  return (
    <div
      className='lightText14 d-flex flex-wrap card mb8 align-items-center justify-content-between mb8'
      style={{overflow: "hidden", minHeight: '48px', background: '#FAC898'}}
    >
      <h3 style={{color: '#222'}} className='ml16'>Hidden Collection</h3>
      <p>This collection is hidden. {text}</p>
      <Link to={`/nfts/edit/${collectionAddress}`} className='mr8'><button style={{height: '32px'}} className='linkButton'>Edit Collection</button></Link>
    </div>
  )
}

export default HiddenBanner;