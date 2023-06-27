import classNames from 'classnames';
import * as React from 'react';
import PropTypes from 'prop-types';
import { resolveIpfs } from '@architech/lib';


export interface ImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
}

export const propTypes = {
  /**
   * @default 'img'
   */
};

const TokenImage = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      src,
      ...props
    },
    ref,
  ) => {
    src = resolveIpfs(src || '/placeholder.png');
    return (
      <img // eslint-disable-line jsx-a11y/alt-text
        ref={ref}
        {...props}
        className={classNames(
          className,
        )}
        src={src}
      />
    );
  },
);

TokenImage.displayName = 'Image';
TokenImage.propTypes = propTypes;

export default TokenImage;