import { findDenom } from "@architech/lib";
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

interface NDProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  light?: boolean;
}

export const NetworkDenom: FC<NDProps> = ({size, className, light = false}): ReactElement => {
  const px = size === 'medium' ?  '24px' : size === 'large' ? '48px' : '12px'
  const denom = findDenom(process.env.REACT_APP_NETWORK_DENOM)
  return (
      <DenomImg denom={denom} size={size} light={light} />
  )
};

interface DenomProps extends NDProps {
    denom: Denom;
}

export const DenomImg: FC<DenomProps> = ({denom, size, className, light}): ReactElement => {
    const px = size === 'medium' ?  '24px' : size === 'large' ? '48px' : '12px'
    const image = light && denom.lightImage ? denom.lightImage : denom.image
    if (!denom.image && !denom.displayDenom) return <></>
    return (
            <img
                src={`/${image}`}
                alt={`${denom.displayDenom}`}
                style={{ height: px, width: px }}
                className={className}
            />
    )
};

export default ArchDenom;