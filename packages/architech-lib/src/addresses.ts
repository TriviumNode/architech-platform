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
                NFT_FACTORY_ADDRESS: 'archway1heqvulwv3wk9hhz4xqtuc0h2sh3s7jtka203wc95vd72fasx688sw35uqh',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway12mg4pr4tvl3j5948g6czl0t8tyhrzv3c2gkj5rl42km6agewnjxssp4lk0',
                MARKETPLACE_ADDRESS: 'archway1ffzyy0hpww8q3jwnlrurt72aad74eps26efafpcxyvnvlcvht4dqhp7qdu',
                NFT_FACTORY_ADDRESS: 'archway1jtzx92ju4quwhudzs6qxxdm4stsduj7fsfw080fmyc5q04xsns6s8wz64f',
                CW721_CODE_ID: 68,
                ARCHID_ADDRESS: '',
                RANDOM_MINT_CODE_ID: 69,
                COPY_MINT_CODE_ID: 70,
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}