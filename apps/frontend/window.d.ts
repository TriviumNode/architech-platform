import { Window as KeplrWindow, Keplr } from '@keplr-wallet/types';
import { Window as CosmostationWindow } from '@cosmostation/extension'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow extends CosmostationWindow  {
    wallet?: Keplr;
    archx?: Keplr;
    leap?: Keplr;
  }
}
