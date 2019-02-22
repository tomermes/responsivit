const {join} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// works great. with the default 'eval', imports are not mapped. inline-source-map also works.
exports.devtool = 'source-map'

// root of the monorepo, so that paths in output will be clickable
exports.context = join(__dirname, '..', '..')

exports.entry = join(__dirname, 'src', 'client-bootstrap')

exports.output = {
    path: join(__dirname, 'umd')
}

exports.module = {
    rules: [
        {
            test: /\.tsx?$/,
            loader: '@ts-tools/webpack-loader'
        },
        {
            test: /\.png$/,
            use:[
                {loader: "file-loader"}
            ]
        },
        {
            test: /\.css$/, 
            loader: "style-loader!css-loader",
        }
    ]
}

exports.resolve = {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
}

exports.plugins = [
    new HtmlWebpackPlugin({title: 'Responsivit'})
]
