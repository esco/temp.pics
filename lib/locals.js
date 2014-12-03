var config = require(__basedir + '/config');

module.exports = function(){
  return function(req, res, next) {
    res.locals.IMAGE_URI = config.imageUri;
    next();
  }
}