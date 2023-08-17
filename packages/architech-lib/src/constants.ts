import { Denom } from "@architech/types";
import { ArchwayClient } from "@archwayhq/arch3.js";

export const PLACEHOLDER_URL = 'https://placehold.jp/a2a2a2/ffffff/350x350.png?text=%F0%9F%93%B7';

export const LOGIN_STRING = `Login to Architech`

export const ADMINS = [
  'archway1tmgvz9r9q0nlv00kclksvlk903pz9gjnaz62ng',
  'archway1z6efg4hw5eeaq50kjp55z7tehl2xxyg3nnny3x'
]

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
        nativeDenom: 'aconst',
        decimals: 18,
        displayDenom: 'CONST',
        image: 'arch.svg',
        coingeckoId: 'archway',
    },
    {
        nativeDenom: 'aarch',
        decimals: 18,
        displayDenom: 'ARCH',
        image: 'arch.svg',
        coingeckoId: 'archway',
    },
]

export const unknownDenom: Denom = {
    decimals: 0,
    displayDenom: 'UNKNOWN',
    image: 'arch.svg',
};

export const noDenom: Denom = {
    decimals: 0,
    displayDenom: '',
    image: '',
};

export const findDenom = (denom: string): Denom => {
    const found = DENOMS.find(d=>d.nativeDenom === denom);
    return found || unknownDenom;
}

export const findToken = (cw20_addr: string): Denom => {
    const found = DENOMS.find(d=>d.cw20Contract === cw20_addr)
    return found || unknownDenom;
}