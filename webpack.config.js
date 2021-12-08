const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BannerPlugin } = require("webpack");

const isDev = process.env.NODE_ENV === "development";

const heroiconLicense = `
MIT License
      
Copyright (c) 2020 Refactoring UI Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: isDev ? "development" : "production",

  devtool: isDev ? "inline-source-map" : false,

  entry: {
    contents: path.resolve(__dirname, "./src/contents.ts"),
    contents_main: path.resolve(__dirname, "./src/contents_main.tsx"),
  },

  output: {
    path: path.resolve(__dirname, "build"),
    clean: true,
  },

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "esbuild-loader",
            options: {
              loader: "tsx",
              minify: !isDev,
              target: "es2015",
              tsconfigRaw: require("./tsconfig.json"),
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: "contents.css" }),
    new CopyPlugin({ patterns: [{ from: "./public/manifest.json", to: "manifest.json" }] }),
    new BannerPlugin({ banner: heroiconLicense, include: ["contents_main"] }),
  ],
};
