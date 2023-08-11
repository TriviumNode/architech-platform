import { faCheckSquare } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "react-tooltip"

const VerifiedBadge = ({
  content
}:{
  content: 'Collection' | 'User';
}) => {
  return (
    <>
      <FontAwesomeIcon
        icon={faCheckSquare}
        style={{color: '#0166DCDD'}}
        size='lg'
        data-tooltip-id="verified-tooltip"
        data-tooltip-content={`Verified ${content}`}
        data-tooltip-place="right"
      />
      <Tooltip id="verified-tooltip" />
    </>
  )
}

export default VerifiedBadge;