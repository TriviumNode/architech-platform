import proxyflare from "@flaregun-net/proxyflare-for-pages"
import { Route } from "@flaregun-net/proxyflare-for-pages/build/types"

const apiRoute: Route = {
  from: {
    pattern: "alpha.architech.zone/api/*",
    methods: ["GET","POST"],
  },
  to: { url: "http://api.architech.zone:4050" },
  headers: {
    request: {
      // "content-type": "application/json",
      "custom-test": "TESTHEADER"
    },
    response: {
      "custom-test": "TESTHEADER"
    }
  }
}

export const onRequest: PagesFunction[] = [
  (context) =>
    proxyflare({
      config: {
        global: { debug: true },
        routes: [apiRoute],
      },
    })(context),
  // other Pages plugins and middleware
]

