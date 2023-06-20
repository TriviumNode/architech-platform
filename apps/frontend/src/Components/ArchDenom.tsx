import { Denom } from "@architech/types";
import { FC, ReactElement } from "react";

const ArchDenom: FC<any> = (): ReactElement => {
    return (
        <img
            src="/arch.svg"
            alt="ARCH"
            style={{ maxHeight: '1em' }}
        />
    )
};

interface DenomProps {
    denom: Denom;
}

export const DenomRow: FC<DenomProps> = ({denom}): ReactElement => {
    return (
            <img
                src={`/${denom.image}`}
                alt={`/${denom.displayDenom}`}
                style={{ maxHeight: '1em' }}
            />
    )
};

export default ArchDenom;