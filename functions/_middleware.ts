import proxyflare from "@flaregun-net/proxyflare-for-pages"
import { Route } from "@flaregun-net/proxyflare-for-pages/build/types"

const apiRouteGet: Route = {
  from: {
    pattern: "alpha.architech.zone/api/*",
    methods: ["GET"],
  },
  to: { url: "api.architech.zone:4050" },
  // headers: {
  //   response: {
  //     "content-type": "application/json",
  //   }
  // }
}

const apiRoutePost: Route = {
  from: {
    pattern: "alpha.architech.zone/api/*",
    methods: ['POST'],
  },
  to: { url: "api.architech.zone:4050" },
  headers: {
    request: {
      "content-type": "application/json",
      "test": "TESTHEADER"
    },
    response: {
      "content-type": "application/json",
      "test": "TESTRESPONSEHEADER"
    }
  }
}
  
const routes: Route[] = [apiRouteGet, apiRoutePost]

// `PagesFunction` is from @cloudflare/workers-types
export const onRequest: PagesFunction[] = [
  (context) =>
    proxyflare({
      config: {
        global: { debug: true },
        routes,
      },
    })(context),
  // other Pages plugins and middleware
]

