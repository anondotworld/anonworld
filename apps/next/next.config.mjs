import webpack from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/': [
        './node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/**/*',
        './node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/barretenberg_wasm_thread/factory/node/thread.worker.js',
      ],
    },
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    }
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '')
      })
    )
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: '../../node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/barretenberg-threads.wasm',
            to: '.',
          },
        ],
      })
    )
    return config
  },
  async headers() {
    // These headers are necessary to enabled SharedArrayBuffer
    // which is needed for multi-threaded proof generation
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
