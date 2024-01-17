import { Collection, marketplace } from "@architech/types";
import BigNumber from "bignumber.js";
import { ADMINS } from "./constants";

export const resolveIpfs = (uri: string, useProxy = false) => {
    const isIpfs = uri.startsWith('ipfs://');
    // if (isIpfs) uri = `https://ipfs.filebase.io/ipfs/${uri.replace('ipfs://', '')}`;
    // if (isIpfs) uri = `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;

    if (isIpfs){
      if (useProxy) uri = `${process.env.REACT_APP_BACKEND_URL}/ipfs/proxy/${uri.replace('ipfs://', '')}`;
      else uri = `https://ipfs.filebase.io/ipfs/${uri.replace('ipfs://', '')}`;
    }

    return uri;
}

export const denomToHuman = (amount: number | string, decimals: number) => {
    amount = parseInt(amount.toString());
    const humanAmount = amount / Math.pow(10, decimals)
    return humanAmount;
}

export const humanToDenom = (amount: number | string, decimals: number): string => {
    amount = parseFloat(amount.toString());
    const result = amount * Math.pow(10, decimals)
    const denomAmount = BigNumber(result)
    return denomAmount.toFixed();
}

export const calculateFee = (amount: number | string, fee: number): string => {
    amount = parseFloat(amount.toString());
    const result = amount * fee
    const feeAmount = BigNumber(result)
    return feeAmount.toFixed();
}

export const findFloor = (asks: marketplace.Ask[], decimals: number) => {
    const floor: string = asks &&
        asks.length ?
            asks.filter(a=>a.cw20_contract === undefined || a.cw20_contract === null)
                .sort((a, b)=>parseInt(a.price) - parseInt(b.price))[0].price
        : '0'
    const floorAmount = denomToHuman(floor, decimals);
    return floorAmount;
}

export const truncateAddress = (addr: string, prefix?: string) => {
    if (prefix && !addr.startsWith(`${prefix}1`)) return addr;
    return `${addr.slice(0,10)}...${addr.slice(addr.length-6)}`
}

export function randomString(length: number, chars = '0123456789abcdefghijklmnopqrstuvwxyz') {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export const epochToDate = (unixEpoch: number | string) => {
  if (typeof unixEpoch === 'string') unixEpoch = parseInt(unixEpoch);
  return new Date(unixEpoch * 1000)
}

export const isCollectionCreator = (address: string, collection: Collection) => {
  return collection.creator === address || collection.admin === address
}

export const isAdmin = (address: string) => {
  return ADMINS.includes(address);
}

export const trimNonNumeric = (str: string) => {
  return str.replace(/[^0-9.]/gi, '');
}

// If the collection is hidden: Returns true is the user address is the collection owner / an architech admin. Otherwise returns false.
// If the collection is not hidden: Returns true.
export const canSeeCollection = (collection: Collection, userAddress?: string): boolean => {
  const isHidden = collection.hidden || collection.admin_hidden;
  const canSeeHidden = userAddress && (userAddress === collection.creator || userAddress === collection.admin || ADMINS.includes(userAddress));
  if (isHidden) return canSeeHidden;
  else return true;
};