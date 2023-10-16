import { epochToDate } from "@architech/lib";
import { Collection, CollectionMinterI, Token } from "@architech/types";
import Color from "./color";
import { NoisQueryClient, NOIS_PAYMENT_CONTRACT, RANDOMNESS_COST } from "./queryClient";
import { queryPaymentContractBalance } from "./wasm/proxyQuery";

export function getCollectionName(collection: Collection) {
    return collection.collectionProfile.name || collection.cw721_name
}

export const getTokenName = (token: Token) => {
  const num = isNaN(token.tokenId as any) ? null : '#'
  const nftName = !!token.metadataExtension?.name ? token.metadataExtension.name : `${num}${token?.tokenId}`
  return nftName;
}

export const saturateColor = (input: string) => {
    const c: any = new Color(input);
    const hsl = c.hslData();
    const newHsl = [hsl[0], hsl[1] + .1, hsl[2] - .1];
    const rgb = Color.HSLtoRGB(newHsl);
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}

export const getMinterDates = (collectionMinter: CollectionMinterI) => {
  const startDate = collectionMinter.launch_time ?
  epochToDate(collectionMinter.launch_time)
: undefined;

  const wlStartDate = collectionMinter.whitelist_launch_time ?
    epochToDate(collectionMinter.whitelist_launch_time)
  : undefined;

  const endDate = collectionMinter.end_time ?
  epochToDate(collectionMinter.end_time)
  : undefined;

  return { startDate, wlStartDate, endDate }
}

// Queries NOIS payment contract to ensure enough funds.
export const isRandomnessReady = async () => {
  try {
    const balance = await queryPaymentContractBalance({
      client: NoisQueryClient,
      address: NOIS_PAYMENT_CONTRACT
    });
    const minimum = RANDOMNESS_COST * 25;
    
    console.log(`Randomness Balance: ${balance}\nRandomness Minimum: ${minimum}\nRandomness Cost: ${RANDOMNESS_COST}`)
    if (balance < minimum) {
      // console.error(`Randomness Balance: ${balance}\nRandomness Minimum: ${minimum}\nRandomness Cost: ${RANDOMNESS_COST}`)
      throw new Error('Randomness payment contract has insufficent funds. Please contract Architech support.')
    }
  } catch(e: any) {
    if (e.toString().includes('has insufficent funds')) throw e;
    else {
      console.error(`Unable to verify randomness contract:\n`, e);
      throw new Error(`Unable to verify randomness contract: ${e.toString()}`)
    }
  }
}