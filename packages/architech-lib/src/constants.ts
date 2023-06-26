import { Denom } from "@architech/types";


export const LOGIN_STRING = `Login to Architech`

export const getLoginString = (nonce: string) => {
    return `${LOGIN_STRING}\n${nonce}`
}

export const CATEGORIES = [
    'Art',
    'PFPs',
    'Utility',
]


export const DENOMS: Denom[] = [
    {
        nativeDenom: 'stake',
        decimals: 6,
        displayDenom: 'ARCH',
        image: 'arch.svg'
    },
    {
        nativeDenom: 'aconst',
        decimals: 18,
        displayDenom: 'ARCH',
        image: 'arch.svg'
    },
]

const unknownDenom: Denom = {
    decimals: 0,
    displayDenom: 'UNKNOWN',
    image: 'arch.svg',
};

export const findDenom = (denom: string): Denom => {
    const found = DENOMS.find(d=>d.nativeDenom === denom);
    return found || unknownDenom;
}

export const findToken = (cw20_addr: string): Denom => {
    const found = DENOMS.find(d=>d.cw20Contract === cw20_addr)
    return found || unknownDenom;
}