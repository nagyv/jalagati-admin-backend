'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  Schema = mongoose.Schema;

var ResztvevoSchema = new Schema({
  jogas: {
    type: Schema.ObjectId,
    ref: 'Jogas',
    required: true
  },
  alkalom: {
    type: Schema.ObjectId,
    ref: 'Alkalom',
    required: true
  },
  fizetett: Number,
  berlet: {
    type: Schema.ObjectId,
    ref: 'Berlet'
  },
  torulkozo: {
    type: Boolean,
    default: false
  },
  szamla: {
    type: Boolean,
    default: false
  },
  kupon: {
    type: Boolean,
    default: false
  },
  note: String
});
ResztvevoSchema.pre('save', function(next){
  if (this.isNew) {
    var resztvevo = this;
    this.model('Jogas').findOne(this.jogas, function(err, jogas){
      if (jogas.berlet) {
        resztvevo.fizetett = 0;
        resztvevo.berlet = jogas.berlet._id;
        jogas.berlet.hasznal(resztvevo, next);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});
ResztvevoSchema.pre('remove', function(next){
  this.restoreBerlet(next);
});
ResztvevoSchema.method('restoreBerlet', function(cb){
  var resztvevo = this;
  if(this.berlet) {
    resztvevo.populate('jogas');
  }
  async.waterfall([
    function(cb){
      resztvevo.populate(cb);  // populate only executes when receives a callback
    },
    function(resztvevo, cb){
      if(resztvevo.berlet) {
        var berlet = _.find(resztvevo.jogas.berletek, {'_id': mongoose.Types.ObjectId(resztvevo.berlet)});
        if(berlet) {
          berlet.restore(resztvevo.alkalom, function(err/*, jogas*/){
            if(err) {
              cb(err);
            }
            else{
              resztvevo.berlet = null;
              resztvevo.save(cb);
            }
          });
        } else {
          var server = require('../index');
          server.plugins.raven.client.captureWarning({
            'message': 'No berlet to restore',
            'resztvevo': resztvevo._id,
            'berlet': resztvevo.berlet
          });
          cb(null, resztvevo);
        }
      } else {
        cb(null, resztvevo);
      }
    }
  ], cb);
});

var AlkalomSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  starts: {
    type: Date
  },
  location: {
    type: String
  },
  tartja: {
    type: String
  },
  segiti: {
    type: String
  },
  state: {
    type: String,
    default: 'open'
  },
  nyito: {
    type: Number,
    default: 0
  },
  zaro: {
    type: Number,
    default: 0
  },
  extra: {
    type: Number,
    default: 0
  },
  resztvevok: [{
    name: String,
    resztvevo: {
      type: Schema.ObjectId,
      ref: 'Resztvevo'
    }
  }]
});

/**
 * Validations
 */
AlkalomSchema.path('starts').validate(function (starts) {
  return starts.length;
}, 'Date cannot be blank');

AlkalomSchema.path('tartja').validate(function (tartja) {
  return tartja.length;
}, 'Jogatarto cannot be blank');

AlkalomSchema.path('location').validate(function (location) {
  return location.length;
}, 'Helyszín cannot be blank');

/**
 * Creates a new resztvevo instance for jogas
 *
 * The callback is always called with (err, alkalom)
 *
 * @param jogas
 * @param cb
 */
AlkalomSchema.methods.addResztvevo = function (jogas, cb) {
  var Resztvevo = this.model('Resztvevo');

  var resztvevo = new Resztvevo({
    jogas: jogas.id,
    alkalom: this.id
  });
  var that = this;
  this.resztvevok.push({
    name: jogas.name,
    resztvevo: resztvevo.id
  });
  this.save(function(err/*, alkalom*/){
    if(err){
      cb(err);
    } else{
      resztvevo.save(function(err /*, resztvevo */){
        if(err) {
          cb(err);
        } else {
          cb(null, that);
        }
      });
    }
  });
};

/**
 * Removes a resztvevo instance.
 *
 * The callback is always called with (err, null)
 *
 * @param resztvevo
 * @param cb
 */
AlkalomSchema.methods.removeResztvevo = function (resztvevo, cb) {
  this.resztvevok = _.reject(this.resztvevok, {
    resztvevo: mongoose.Types.ObjectId(resztvevo)}
  );
  var Resztvevo = this.model('Resztvevo');
  this.save(function(err){
    if(err){
      cb(err);
    } else{
      Resztvevo.remove({_id: resztvevo}, cb);
    }
  });
};
AlkalomSchema.method('close', function(cb){
  this.state = 'closed';
  this.save(cb);
});

mongoose.model('Alkalom', AlkalomSchema);
mongoose.model('Resztvevo', ResztvevoSchema);
