import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";

type Props = {
  disabled?: boolean;
  spin: boolean;
  onClick?: (e: any)=>any;
  refreshWhat: string;
}

const RefreshButton = ({disabled, spin, onClick, refreshWhat}: Props) => {
  return (
    <>
      <button
        data-tooltip-id="refresh-tooltip"
        data-tooltip-content={`Refresh ${refreshWhat}`}
        data-tooltip-place="left"
        disabled={disabled}
        onClick={onClick}
        style={{color: '#666666', padding: 0}}
        type='button'
        className='clearButton mr16'
      >
        <FontAwesomeIcon spin={spin} size='2x' icon={faArrowRotateRight} />
      </button>
      <Tooltip id="refresh-tooltip" />
    </>
  )
}

export default RefreshButton;