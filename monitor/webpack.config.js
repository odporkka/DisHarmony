const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: "./src/index.js",
    watch: true,
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html',
            filename: 'index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', {modules: false}], '@babel/preset-react']
                    }
                }
            }
        ]
    },
    output: {
        filename: "app.js",
        path: __dirname + "/dist",
    },
}