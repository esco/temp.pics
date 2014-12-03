var env = process.env;
var path = require('path');

exports.s3 = {
  secure: false,
  key: env.AWS_KEY,
  secret: env.AWS_SECRET,
  bucket: env.S3_BUCKET,
  region: env.S3_REGION
};

exports.mongodb = {
  user: env.MONGO_DB_USER,
  pass: env.MONGO_DB_PASS,
  uri: env.MONGO_DB_URI
};

exports.gmail = {
  user: env.GMAIL_USER,
  pass: env.GMAIL_PASS,
  from: env.GMAIL_FROM
};

exports.logger = {
  name: env.LOG_NAME,
  streams: [
    {
      level: 10,
      stream: process.stdout
    },
    {
      type: 'rotating-file',
      level: 10,
      path: path.join(env.LOG_PATH + '/' + env.LOG_NAME + '.log'),
      period: '1d',
      count: 7
    }
  ],
  src: true
};

exports.session = {
  secret: env.SESSION_SECRET
};

exports.imageUri = process.env.IMAGE_URI;