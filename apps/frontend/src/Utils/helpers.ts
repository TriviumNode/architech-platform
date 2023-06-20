import { Collection } from "@architech/types";
import Color from "./color";

export function getCollectionName(collection: Collection) {
    return collection.collectionProfile.name || collection.cw721_name
}

export const getFee = (gas: number) => {
    const fee = Math.ceil(gas * parseFloat(process.env.GAS_PRICE || '1'))
    return {
        amount: [{denom: process.env.GAS_DENOM || 'uconst', amount: fee.toString()}],
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