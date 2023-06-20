export const getFee = (gas: number) => {
    const fee = Math.ceil(gas * parseFloat(process.env.GAS_PRICE || '1'))
    return {
        amount: [{denom: process.env.GAS_DENOM || 'uconst', amount: fee.toString()}],
        gas: gas.toString(),
    }
}

export const resolveIpfs = (uri: string) => {
    const isIpfs = uri.startsWith('ipfs://');
    if (isIpfs) uri = `https://ipfs.filebase.io/ipfs/${uri.replace('ipfs://', '')}`;
    // if (isIpfs) uri = `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
    return uri;
}

export const denomToHuman = (amount: number | string, decimals: number) => {
    amount = parseInt(amount.toString());
    const humanAmount = amount / Math.pow(10, decimals)
    return humanAmount;
}

export const humanToDenom = (amount: number | string, decimals: number) => {
    amount = parseFloat(amount.toString());
    const denomAmount = amount * Math.pow(10, decimals)
    return denomAmount;
}