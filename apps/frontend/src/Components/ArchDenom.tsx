import { Denom } from "@architech/types";
import { FC, ReactElement } from "react";

const ArchDenom: FC<{ size?: 'small' | 'medium' | 'large'}> = ({size}): ReactElement => {
    const px = size === 'medium' ?  '24px' : size === 'large' ? '48px' : '12px'
    return (
        <img
            src="/arch.svg"
            alt="ARCH"
            style={{ height: px }}
        />
    )
};

interface DenomProps {
    denom: Denom;
    size?: 'small' | 'medium' | 'large';
}

export const DenomImg: FC<DenomProps> = ({denom, size}): ReactElement => {
    const px = size === 'medium' ?  '24px' : size === 'large' ? '48px' : '12px'
    return (
            <img
                src={`/${denom.image}`}
                alt={`/${denom.displayDenom}`}
                style={{ height: px }}
            />
    )
};

export default ArchDenom;