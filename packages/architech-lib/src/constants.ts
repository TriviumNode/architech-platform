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
    }
]