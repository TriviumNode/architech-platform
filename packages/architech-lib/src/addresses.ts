export const getAddresses = (chainId: string) => {
    switch(chainId){
        case 'archway-1':
            return {
                CREDIT_ADDRESS: 'archway1dex9s7j726jd3an9vk0g00s9cm608jtznzjueczuzcvs2t9zralqhg4f5h',
                MARKETPLACE_ADDRESS: 'archway1vg04jejq07cxulffmmgjtxs0gfsezx99a2ajtwuakrc8krf354rqgv8t4a',
                NFT_FACTORY_ADDRESS: 'archway1974a8z4w0ph48nfexf5jt2nqxvmyzz3n9gahfv62d6yalr9fsm3qhln996',
                CW721_CODE_ID: 44,
                ARCHID_ADDRESS: 'archway1275jwjpktae4y4y0cdq274a2m0jnpekhttnfuljm6n59wnpyd62qppqxq0',
            };
            break;
        case 'constantine-3':
            return {
                CREDIT_ADDRESS: 'archway1xmlcasxa8xs9saz2avk9t4pcjyf6h94skhwdhm6vsqrsvhmvq96qnxvhku',
                MARKETPLACE_ADDRESS: 'archway13f8fv36qm87kaj3hfl9fspyv2p6jusvu92z59z3f0vgs975xjy4qwdg4cg',
                NFT_FACTORY_ADDRESS: 'archway1u5fkvp7q9f32fxjrm6smwgcm69v96fh5t8pfh3qatzgn2mgr5upq8xq7na',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway1v3tw26hgav6nygcc3gyhfcw26xx90f2yld7ngfnj2r66uc3kgq2sdt0yfu',
                MARKETPLACE_ADDRESS: 'archway1fg6kswkg2m35deyrkn2lhvwsk7lxrpwamgkd58lqz48v8lxxp4vq7ee8qt',
                NFT_FACTORY_ADDRESS: 'archway1kjez6dlmzk95jufjrpagz4xfgh3kqgcwsa5pw6yhy5u4a6e6z96qr5fm5p',
                CW721_CODE_ID: 213,
                ARCHID_ADDRESS: '',
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}