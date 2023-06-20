import { CSSProperties, FC, ReactElement } from "react"

const Vr: FC<{color?: string}> = ({color = 'rgba(0, 0, 0, 0.2)'}): ReactElement => {
    return (
        <div style={{border: `1px solid ${color}` }} />
    )
}

export default Vr;