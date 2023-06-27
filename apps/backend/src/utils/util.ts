import { getAverageColor } from 'fast-average-color-node';
import secureRandom from 'secure-random';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export const generateNonce = () => {
  return Buffer.from(secureRandom(8, { type: 'Uint8Array' })).toString('base64');
};

export const processAverageColor = async (imageUrl: string): Promise<string> => {
  let url: string = imageUrl as string;
  const isIpfs = url.startsWith('ipfs://');
  if (isIpfs) url = `https://ipfs.filebase.io/ipfs/${url.replace('ipfs://', '')}`;
  const color = await getAverageColor(url);
  const avgColor = color.hex;
  return avgColor;
};
