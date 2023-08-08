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
                NFT_FACTORY_ADDRESS: 'archway19wlwrrflvklmy8jj8dm3ssekn5x97ahqsttr4fq5y4540xskgjaqwjadzh',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway106nal47c3rwre9e0v7gjd8ff89s0rhkz5l4ywlgrj9j60zx26r9slc6ggf',
                MARKETPLACE_ADDRESS: 'archway1x6ttpp3vpzaknxcc25u0mjrlnagu3agvwnyl0wpwhtjdljaw8aks75a344',
                NFT_FACTORY_ADDRESS: 'archway18h8ncg9szj3v92cz289qz3ndwqk5zema4cr2t4e7amjaehrae52qwhpy2n',
                CW721_CODE_ID: 73,
                ARCHID_ADDRESS: '',
                RANDOM_MINT_CODE_ID: 69,
                COPY_MINT_CODE_ID: 70,
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}