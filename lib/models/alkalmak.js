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
  }
});
ResztvevoSchema.pre('save', function(next){
  if (this.isNew) {
    var resztvevo = this;
    this.model('Jogas').findOne(this.jogas, function(err, jogas){
      if (jogas.berlet) {
        resztvevo.berlet = jogas.berlet._id;
        jogas.berlet.hasznal(resztvevo, next);
      } else {
        next();
      }
    });
  }
});
ResztvevoSchema.pre('remove', function(next){
  var resztvevo = this;

  if(this.berlet) {
    resztvevo.populate('berlet');
  }

  async.waterfall([
    function(cb){
      resztvevo.populate(cb);  // populate only executes when receives a callback
    },
    function(resztvevo, cb){
      if(resztvevo.berlet) {
        resztvevo.berlet.restore(resztvevo.alkalom, cb);
      } else {
        cb(null, resztvevo);
      }
    }
  ], next);
});
ResztvevoSchema.method('update', function(data, cb){
  // berlet hozzaadasa
  // berlet elvetele
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
  resztvevok: [
    {
      type: Schema.ObjectId,
      ref: 'Resztvevo'
    }
  ]
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

AlkalomSchema.methods.addResztvevo = function (jogas, cb) {
  var Resztvevo = this.model('Resztvevo');

  var resztvevo = new Resztvevo({
    jogas: jogas.id,
    alkalom: this.id
  });
  this.resztvevok.push(resztvevo.id);
  this.save(function(err/*, alkalom*/){
    if(err){
      cb(err);
    } else{
      resztvevo.save(cb);
    }
  });
};

AlkalomSchema.methods.removeResztvevo = function (resztvevo, cb) {
  this.resztvevok = _.pull(this.resztvevok, resztvevo);
  var Resztvevo = this.model('Resztvevo');
  this.save(function(err){
    if(err){
      cb(err);
    } else{
      Resztvevo.remove({_id: resztvevo}, cb);
    }
  });
};

mongoose.model('Alkalom', AlkalomSchema);
mongoose.model('Resztvevo', ResztvevoSchema);
