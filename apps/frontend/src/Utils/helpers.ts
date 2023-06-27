import { Collection } from "@architech/types";
import Color from "./color";

export function getCollectionName(collection: Collection) {
    return collection.collectionProfile.name || collection.cw721_name
}

export const getFee = (gas: number) => {
    console.log('GAS PRICE', process.env.REACT_APP_GAS_PRICE)
    console.log('GAS DENOM', process.env.REACT_APP_GAS_DENOM)
    const fee = Math.ceil(gas * parseFloat(process.env.REACT_APP_GAS_PRICE || '1'))
    console.log('FEE', fee)
    return {
        amount: [{denom: process.env.REACT_APP_GAS_DENOM || 'aconst', amount: fee.toString()}],
        gas: gas.toString(),
    }
}

export const saturateColor = (input: string) => {
    const c: any = new Color(input);
    const hsl = c.hslData();
    const newHsl = [hsl[0], hsl[1] + .1, hsl[2] - .1];
    const rgb = Color.HSLtoRGB(newHsl);
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}