const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = function override (config, env) {
    config.resolve.fallback = {
        // "fs": false,
        // "tls": false,
        // "net": false,
        // "http": require.resolve("stream-http"),
        // "https": false,
        // "zlib": require.resolve("browserify-zlib") ,
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        // "util": require.resolve("util/"),
        "crypto": require.resolve("crypto-browserify"),
        // "url": require.resolve("url"),
        "buffer": require.resolve("buffer"),
        "Buffer": require.resolve("buffer"),
    }

    // idk what this does or is we need it
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]

    config.plugins = [
      ...config.plugins,
      // new webpack.ProvidePlugin({
      //   Buffer: ["buffer", "Buffer"],
      // }),
      new NodePolyfillPlugin(),
    ]

    return config
}