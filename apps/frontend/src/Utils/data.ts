import { denomToHuman, findDenom, findToken, noDenom, unknownDenom } from "@architech/lib";
import { Denom, CollectionMinterI } from "@architech/types";
import axios from "axios";


export const getPrice = async (coingeckoId: string | undefined, amount: number): Promise<number> => {
    if (!coingeckoId) return 0;
    if (coingeckoId.toLowerCase() === 'archway' || coingeckoId.toLowerCase() === 'arch' || coingeckoId.toLowerCase() === 'const') return await getArchPrice(amount);

    const {data} = await axios.get(`https://api.coingecko.com/api/v3/coins/${coingeckoId}`, {
        withCredentials: false,
    })
    const price: number = data.market_data.current_price.usd;
    return price * amount;
}


export const getArchPrice = async (amount: number) => {
    try {
        const {data} = await axios.get('https://api-osmosis.imperator.co/tokens/v2/ARCH', {
            withCredentials: false,
        })
        const price = data.find((d: any)=>d.denom === 'ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85').price || 0;
        return price * amount;
    } catch(err) {
        console.error('Error fetching ARCH price', err)
        return 0;
    }
}


export type Price = {
  denom: Denom;
  displayAmount: string;
  displayUsd: string;
  denomAmount: number;
}

export type Prices = {
  public: Price;
  private?: Price;
}

export const calculatePrices = async (collectionMinter: CollectionMinterI, getUsd = true) => {
  const publicPrice: Price = await(async()=>{
    const payment = collectionMinter?.payment

    let saleAmount: string = '--';
    let usdAmount: string = '--';
    let saleDenom: Denom = unknownDenom;

    if (!payment) {
      saleAmount = 'Free';
      usdAmount = '';
      saleDenom = noDenom;
    } else if (payment.token) {
      const denom = findToken(payment.token);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(payment.amount, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
        usdAmount = getUsd ? (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 }) : '--';
      }
    } else if (payment.denom) {
      const denom = findDenom(payment.denom);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(payment.amount, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
        usdAmount = getUsd ? (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 }) : '--';
      }
    }

    return { displayAmount: saleAmount, displayUsd: usdAmount, denom: saleDenom, denomAmount: payment?.amount ? parseInt(payment.amount) : 0 }
  })()

  const privatePrice: Price | undefined = await(async()=>{
    const payment = collectionMinter?.whitelist_payment

    let saleAmount: string = '--';
    let usdAmount: string = '--';
    let saleDenom: Denom = unknownDenom;

    if (!payment) {
      return undefined;
    } else if (payment.token) {
      const denom = findToken(payment.token);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(payment.amount, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
        usdAmount = getUsd ? (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 }) : '--';
      }
    } else if (payment.denom) {
      const denom = findDenom(payment.denom);
      if (denom) {
        saleDenom = denom;
        const num = denomToHuman(payment.amount, denom.decimals)
        saleAmount = num.toLocaleString("en-US", { maximumFractionDigits: parseInt(process.env.REACT_APP_NETWORK_DECIMALS) })
        usdAmount = getUsd ? (await getPrice(saleDenom.coingeckoId, num)).toLocaleString("en-US", { maximumFractionDigits: 2 }) : '--';
      }
    }

    return { displayAmount: saleAmount, displayUsd: usdAmount, denom: saleDenom, denomAmount: payment?.amount ? parseInt(payment.amount) : 0 }
  })()

  return({
    private: privatePrice,
    public: publicPrice,
  })
}