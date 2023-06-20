import proxyflare from "@flaregun-net/proxyflare-for-pages"
import { Route } from "@flaregun-net/proxyflare-for-pages/build/types"

const apiRoute: Route = {
    from: {
      pattern: "alpha.architech.zone/api/*",
      methods: ["GET", 'POST'],
    },
    to: { url: "api.architech.zone" },
    headers: {
      request: { "Content-Type" : "application/json" }
    } 
}

const apiRoute2: Route = {
    from: { pattern: "alpha.architech.zone/example" },
    to: { url: "example.com" },
}
  
const routes: Route[] = [apiRoute, apiRoute2]

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

