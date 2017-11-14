const path = require('path');

module.exports = {
  resolve: {
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
        include: path.resolve(__dirname, '../')
      },{
        test: /\.md$/,
        use: "raw-loader"
      }
    ]
  }
};
