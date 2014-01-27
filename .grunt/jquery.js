module.exports = {
  build : {
    options : {
      prefix: "jquery-",
      minify: true
    },
    output   : "./public/components/jquery",
    versions : {
      "2.0.3" : ["ajax", "deprecated"]
    }
  }
};