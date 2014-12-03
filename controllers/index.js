var app = require(__basedir + 'app');
var config = require(__basedir + 'config');
var path = require('path');

var models = require(__basedir + 'models');
var mailService = require(__basedir + 'services/mail');

// Libs
var logger = require(__basedir + 'lib/logger');
var s3 = require(__basedir + 'lib/s3');


// Routes
app.post('/notify', notify);
app.post('/broken', broken);
app.get('/i/:picId', single);
app.get('/', index);

// Route handlers
function index(req, res){
  logger.info('index route');
  var conditions = {};

  models.pic.findListed(conditions, function(err, pics){
    logger.info('found images', pics, conditions);
    if (err) {
      logger.error('err getting pics', err);
      return res.send(404);
    }
    res.render('index.html', { pics: pics });
  });
};

function single(req, res) {
  var picId = req.params.picId;
  var conditions = {};

  models.pic.findOne({picId: picId}, function(err, pic){
    if (err) {
      logger.error('err getting pic', err);
      return res.send(404);
    }

    if (!pic || pic.isExpired()) {
      return res.send('Expired');
    }

    if (res.locals.is_desktop) {
        conditions.picId = { $gt: picId };
        models.pic
        .findListed(conditions, {picId:true})
        .limit(1)
        .exec(function(err, next) {
            var nextPicId = next.length ? next[0].picId : 128028;
            res.render('index.html', { pics: [pic], next: nextPicId, single: true });
        });
        return;
    }

    models.pic.findListed(conditions, function(err, pics){
      logger.info('found other images');
      if (err) {
        logger.error('err getting pics', err);
        return res.send(404);
      }
      pics = pics.filter(function(pic){
        return pic.picId != picId;
      });
      pics.unshift(pic);
      res.render('index.html', { pics: pics, single: true });
    });
  });
}

/**
 * Notify user when sign up is available
 */
function notify(req, res) {
  var email = req.body.email;

  if (!email) {
    return res.send(400);
  }

  mailService.notifySignUp(email).then(function(response){
    res.send("we'll let you know");
  }).catch(function(){
    res.send("Email servers are overloaded. Please try again.")
  });
}

/**
 * Remove images that report 404 and return 404 from S3
 */
function broken(req, res) {
  var url = req.body.src;

  if (!url) {
    return res.send(404);
  }

  url = path.basename(url);

  s3.getFile(url, function(err, _res){
    var ext;
    var id;

    if (_res.statusCode !== 404) {
      return res.send(404);
    }

    ext = path.extname(url);
    // Escape for RegEx
    ext = ext.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    // Extract id by removing extension
    id = url.replace(new RegExp(ext+'$'), '');

    models.pic.update({ picId: id }, { $set: { active: false, is404: true} }, function(err) {
      if (err) {
        logger.info('err removing broken image', err);
      }
      return res.send(200);
    });
  });
}