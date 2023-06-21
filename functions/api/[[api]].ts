import proxyflare from "@flaregun-net/proxyflare-for-pages"
import { Route } from "@flaregun-net/proxyflare-for-pages/build/types"

export const onRequest: PagesFunction[] = [
  (context) => handle(context.request),
  // other Pages plugins and middleware
]

// We support the GET, POST, HEAD, and OPTIONS methods from any origin,
// and allow any header on requests. These headers must be present
// on all responses to all CORS preflight requests. In practice, this means
// all responses to OPTIONS requests.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
}

const API_URL = "http://server.architech.zone:4050"

/**
 * Receives a HTTP request and replies with a response.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request: Request): Promise<Response> {
  const { method, url, headers } = request
          console.log("{}",headers)

  const { host, pathname, search } = new URL(url)
  const dhURL = API_URL + pathname + search
  console.log(dhURL)

    request = new Request(dhURL, request)
    request.headers.set("Origin", new URL(dhURL).origin)
    let response = await fetch(request)
    response = new Response(response.body, response)
    response.headers.set("Access-Control-Allow-Origin", headers.get("Origin") as string)
    response.headers.append("Vary", "Origin")
    return response
}

/**
 * Responds with an uncaught error.
 * @param {Error} error
 * @returns {Response}
 */
function handleError(error) {
  console.error('Uncaught error:', error)

  const { stack } = error
  return new Response(stack || error.toString(), {
    status: 500,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    }
  })
}

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ){
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
    // Allow all future content Request headers to go back to browser
    // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}

const handle = async(request: Request) => {
  const url = new URL(request.url)
  console.log(url)
  if (request.method === "OPTIONS") {
    // Handle CORS preflight requests
    return handleOptions(request);
  }
  else if(
    request.method === "GET" ||
    request.method === "HEAD" ||
    request.method === "POST"
  ){
    // Handle requests to the API server
    return handleRequest(request)
  }
  else {
    return (
      new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
    );
  }
}