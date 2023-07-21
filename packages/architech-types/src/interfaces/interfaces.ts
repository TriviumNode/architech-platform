export interface Denom {
    nativeDenom?: string;
    cw20Contract?: string;
    decimals: number;
    displayDenom: string;
    image: string;
    coingeckoId?: string;
}