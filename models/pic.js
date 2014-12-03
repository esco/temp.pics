module.exports = function(db, Schema) {
  var moment = require('moment');
  var autoIncrement = require('mongoose-auto-increment');
  var _ = require('underscore');
  var PicSchema = new Schema({
    title: String,
    description: String,
    filename: String,
    extension: String,
    hashtags: [String],
    upvotes: Number,
    downvotes: Number,
    created: {
      type: Date,
      default: Date.now
    },
    expires: Date,
    active: {
      type: Boolean,
      default: false
    },
    public: {
      type: Boolean,
      default: true
    },
    listed: {
      type: Boolean,
      default: true
    },
    is404: {
      type: Boolean,
      default: false
    }
  });

  PicSchema.statics.findListed = function(conditions, cb) {
    if (typeof conditions === 'function') {
      cb = conditions;
      conditions = {};
    } else {
      conditions = conditions ? conditions : {};
    }

    var now = Date.now();
    var _conditions = {
      expires: { $gt: now },
      active: true,
      public: true,
      listed: true
    };

    _.defaults(conditions, _conditions);

    return this.find(conditions, cb);
  }

  PicSchema.methods.isExpired = function() {
    var now = Date.now();
    return now > this.expires;
  }

  PicSchema.post('init', function(doc){
    if (checkExpiration(doc.expires)) {
      doc.expired = true;
    }
    doc.timeLeft = calculateTimeLeft(doc.expires);
  });

  PicSchema.plugin(autoIncrement.plugin, {
    model: 'Pic',
    field: 'picId',
    startAt: 127837,
    incrementBy: 1
  });

  function calculateTimeLeft(_expires) {
    var now = moment();
    var expires = moment(_expires);
    var timeLeft = moment.duration(expires - now).humanize(true);
    return timeLeft;
  }

  function checkExpiration(_expires) {
    var timeLeft = calculateTimeLeft(_expires);
    return timeLeft.search(/ago/) !== -1;
  }

  return db.model('Pic', PicSchema);
}