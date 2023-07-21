export const getAddresses = (chainId: string) => {
    switch(chainId){
        case 'archway-1':
            return {
                CREDIT_ADDRESS: 'archway1dex9s7j726jd3an9vk0g00s9cm608jtznzjueczuzcvs2t9zralqhg4f5h',
                MARKETPLACE_ADDRESS: 'archway1vg04jejq07cxulffmmgjtxs0gfsezx99a2ajtwuakrc8krf354rqgv8t4a',
                NFT_FACTORY_ADDRESS: '',
                CW721_CODE_ID: 44,
                ARCHID_ADDRESS: 'archway1275jwjpktae4y4y0cdq274a2m0jnpekhttnfuljm6n59wnpyd62qppqxq0',
            };
            break;
        case 'constantine-3':
            return {
                CREDIT_ADDRESS: 'archway1xmlcasxa8xs9saz2avk9t4pcjyf6h94skhwdhm6vsqrsvhmvq96qnxvhku',
                MARKETPLACE_ADDRESS: 'archway13f8fv36qm87kaj3hfl9fspyv2p6jusvu92z59z3f0vgs975xjy4qwdg4cg',
                NFT_FACTORY_ADDRESS: 'archway1eh2g7ev9fltwv96sl8qjnl8n2gaa3dnvqz0c6z7zaguzjgugsa3swemap9',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway14zu2ud0h2e5c8yfzaskm60hme8gpsyh70mhdkhep228l8uyk6z9qxwqtss',
                MARKETPLACE_ADDRESS: 'archway1fxle0557jpnp5arqsxnt4lhm0lkxkhekeylyadmdq7sphk7f88usmehpca',
                NFT_FACTORY_ADDRESS: 'archway1cuwsfs6es857nd45xh7q6hnj36tx6gnpxn8engkxfgxd698f0srq04g6vk',
                CW721_CODE_ID: 3,
                ARCHID_ADDRESS: '',
                RANDOM_MINT_CODE_ID: 123,
                COPY_MINT_CODE_ID: 123,
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}