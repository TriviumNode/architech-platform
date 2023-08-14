export const getAddresses = (chainId: string) => {
    switch(chainId){
        case 'archway-1':
            return {
                CREDIT_ADDRESS: 'archway1dex9s7j726jd3an9vk0g00s9cm608jtznzjueczuzcvs2t9zralqhg4f5h',
                MARKETPLACE_ADDRESS: 'archway1vg04jejq07cxulffmmgjtxs0gfsezx99a2ajtwuakrc8krf354rqgv8t4a',
                NFT_FACTORY_ADDRESS: 'archway1snpedw2xryfl49c76qym66v4wvnupgmjwl08k5tep0nnfx5prjksz8qfg3',
                CW721_CODE_ID: 44,
                ARCHID_ADDRESS: 'archway1275jwjpktae4y4y0cdq274a2m0jnpekhttnfuljm6n59wnpyd62qppqxq0',
            };
            break;
        case 'constantine-3':
            return {
                CREDIT_ADDRESS: 'archway1xmlcasxa8xs9saz2avk9t4pcjyf6h94skhwdhm6vsqrsvhmvq96qnxvhku',
                MARKETPLACE_ADDRESS: 'archway13f8fv36qm87kaj3hfl9fspyv2p6jusvu92z59z3f0vgs975xjy4qwdg4cg',
                NFT_FACTORY_ADDRESS: 'archway147e5025c282fuy2v4an08px47ay8972hq2z9lqddkt5yc9msjvjqgs5aer',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway153r9tg33had5c5s54sqzn879xww2q2egektyqnpj6nwxt8wls70qz3psz3',
                MARKETPLACE_ADDRESS: 'archway1gjrrme22cyha4ht2xapn3f08zzw6z3d4uxx6fyy9zd5dyr3yxgzqn3hq05',
                NFT_FACTORY_ADDRESS: 'archway1xxx3ps3gm3wceg4g300hvggdv7ga0hmsk64srccffmfy4wvcrugq8mqlsw',
                CW721_CODE_ID: 7,
                ARCHID_ADDRESS: '',
                RANDOM_MINT_CODE_ID: 69,
                COPY_MINT_CODE_ID: 70,
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}