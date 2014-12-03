var fs = require('fs');
var Schema = require('mongoose').Schema;
var ObjectId = Schema.Types.ObjectId;
var models = {};
var db = require(__basedir + 'lib/db');
var autoIncrement = require('mongoose-auto-increment');

// Initialize mongoose plugins
autoIncrement.initialize(db);

// Load all models and initialize with database instance `db`
fs.readdirSync(__dirname + '/models').forEach(function(path){
  if (!path.match(/\.js/)) return;
  var modelName = path.replace(/\.js/, '');
  models[modelName] = require(__dirname + '/models/' + modelName)(db, Schema, ObjectId);
});

module.exports = models;