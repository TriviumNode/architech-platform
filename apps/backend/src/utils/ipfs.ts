import ipfsCluster from 'ipfs-cluster-api';

export const cluster = ipfsCluster({ host: '192.168.1.41', port: '9094', protocol: 'http' });
