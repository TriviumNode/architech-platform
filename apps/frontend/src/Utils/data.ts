import axios from "axios";


export const getPrice = async (coingeckoId: string | undefined, amount: number) => {
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

