var app = require(__basedir + 'app');
var stream = require('stream');
var imagemagick = require('imagemagick-stream');
var multiparty = require('multiparty');
var MultiPartUpload = require('knox-mpu');
var async = require('async');
var moment = require('moment');
var path = require('path');
var models = require(__basedir + 'models');
var s3 = require(__basedir + 'lib/s3');
var logger = require(__basedir + 'lib/logger');

// Routes
app.get('/upload', index);
app.post('/upload', post);


// Route handlers
function index(req, res) {
  res.render('upload.html', {device: req.device.type});
}

function post(req, res) {
  var form = new multiparty.Form({ encoding: 'binary' });
  var objectName;
  var picModel;

  function createModel(cb){
    models.pic.create({}, function(err, model){
      if (err) logger.info('db save ', err);
      logger.info('created model', model);
      picModel = model;
      cb(err);
    });
  }

  function parseForm(cb) {
    form.parse(req);
    cb(null);
  }

  function getExpiration(cb) {
    var called = false;
    form.on('field', function(name, value){
      if (name === 'expires') {
        if (!called) {
          called = true;
          value = +new Date(moment().add('hours', value).format());
          cb(null, value);
        }
      }
    });
  }

  function getFileName(cb) {
    form.on('part', function(part){
      // Could be form-data
      if (!part.filename) {
        return;
      }

      var filename = part.filename;
      var extension = path.extname(part.filename);
      var upload = streamPartToS3(picModel.picId + extension, part);

      upload.on('completed', function(){
        cb(null, filename);
        logger.info("COMPLETE!");
      });
    });
  }

  function saveModel(data) {
    data.extension = path.extname(data.filename);
    data.$set = { active: true };
    picModel.update(data, function(err){
      logger.info('---saved', err, data);
      var path = '/i/';
      res.redirect(path + picModel.picId);
    });
  }

  async.waterfall([createModel, parseForm], function(err){
    if (err) {
      logger.info('error! ', err);
      res.send('An error ocurred. Please try again.');
    }
  });

  async.parallel({expires: getExpiration, filename: getFileName}, function(err, results){
    logger.info('saving -- ', results);
    saveModel(results);
  });
}

function streamPartToS3(objectName, imageStream) {

  logger.info('streaming');
  var im = imagemagick();
  var out = new stream.PassThrough();
  var transform = im
    .options({
      resize: "600x450"
    })
    .autoOrient()
    .quality(90);

  im.on('error', function(err){
    logger.info('im error', err);
  });

  imageStream.pipe(transform).pipe(out);


  var options = {
    client: s3,
    objectName: objectName,
    stream: out,
    headers: {
      'x-amz-acl': 'public-read'
    }
  };

  var upload = new MultiPartUpload(options, function(err, body){
    logger.info('multipart', err, body);
  });

  upload.on('uploading', function(a, b, c){
    logger.info('uploading', a, b, c);
  });

  return upload;
}