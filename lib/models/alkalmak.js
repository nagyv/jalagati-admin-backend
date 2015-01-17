var mongoose = require('mongoose'),
  _ = require('lodash'),
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
    var berlet = this.jogas.berlet;
    if (berlet) {
      berlet.hasznal(this);
      this.berlet = berlet._id;
    }
  }
  next();
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
  var that = this;

  var resztvevo = new Resztvevo({jogas: jogas});
  this.resztvevok.push({
    jogas: jogas
  });
  return jogas.addAlkalom(this, function (/*jogas*/) {
    that.save(cb);
  });
};

AlkalomSchema.methods.removeResztvevo = function (resztvevo, cb) {
  var that = this;
  this.resztvevok = _.reject(this.resztvevok, {_id: resztvevo._id});
  resztvevo.removeAlkalom(this, function (/*jogas*/) {
    that.save(cb);
  });
};

mongoose.model('Alkalom', AlkalomSchema);
mongoose.model('Resztvevo', ResztvevoSchema);
