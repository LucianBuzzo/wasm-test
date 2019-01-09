const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  entry: "./src/index.js",
  target: "web",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },

  output: {
    path: path.resolve(__dirname, "dist/"),
    devtoolModuleFilenameTemplate: info => "/" + info.resourcePath
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveApp("public/index.html")
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, process.env)
  ]
};
