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

export const findDenom = (denom: string) => {
    return DENOMS.find(d=>d.nativeDenom === denom)
}

export const findToken = (cw20_addr: string) => {
    return DENOMS.find(d=>d.cw20Contract === cw20_addr)
}