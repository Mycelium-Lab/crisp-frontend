/*eslint-disable*/
//prevents class name uglyfying
const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = {
    chainWebpack: config => {
        config.optimization
            .minimizer('terser')
            .tap(args => {
                const { terserOptions } = args[0]
                terserOptions.keep_classnames = true
                terserOptions.keep_fnames = true
                return args
            })
            config.module
            .rule('supportChaining')
            .test(/\.js$/)
              .include
                .add(path.resolve('node_modules/@lifi'))
                .add(path.resolve('node_modules/microdiff'))
                .end()
            .use('babel-loader')
              .loader('babel-loader')
              .tap(options => ({ ...options, 
                plugins : ['@babel/plugin-proposal-optional-chaining']
              }))
              .end()
    },
    transpileDependencies: [
        '@tanstack'
    ],
    productionSourceMap: false,
    configureWebpack: {
      plugins: [
        new NodePolyfillPlugin()
      ]
    }
}