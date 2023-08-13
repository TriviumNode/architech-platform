import { Window as KeplrWindow, Keplr } from '@keplr-wallet/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {
    wallet?: Keplr;
  }
}
