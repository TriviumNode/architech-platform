declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_RPC_URL: string;
    REACT_APP_REST_URL: string;
    REACT_APP_CHAIN_ID: string;
    REACT_APP_NETWORK_PREFIX: string;
    REACT_APP_BACKEND_URL: string;
    REACT_APP_NETWORK_DENOM: string
    REACT_APP_NETWORK_DECIMALS: string;
  }
}
