'use strict';

var mongoose = require('mongoose'),
  moment = require('moment'),
  _ = require('lodash'),
  Schema = mongoose.Schema;


var BerletSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  fizetett: {
    type: Number,
    required: true
  },
  alkalmak: {
    type: Number,
    min: 0,
    default: 0
  },
  felhasznalva: [{
    alkalom: {
      type: Schema.ObjectId,
      ref: 'Alkalom',
      required: true
    },
    resztvevo: {
      type: Schema.ObjectId,
      ref: 'Resztvevo',
      required: true
    }
  }]
});
BerletSchema.pre('save', function (next) {
  if(this.alkalmak > 0 && !this.endDate) {
    this.endDate = moment(this.startDate).add(3, 'months').toDate();
  }
  if (!moment(this.startDate).isBefore(this.endDate)) {
    next(new Error('Start date should be before end date.'));
  } else {
    next();
  }
}, 'Start date should be before end date.');
BerletSchema.methods.isValid = function () {
  var now = moment();
  if (this.alkalmak > 0 && this.felhasznalva.length >= this.alkalmak) {
    return false;
  } else if (this.alkalmak === 0 &&
    (now.isBefore(this.startDate) || moment(this.endDate).isBefore(now))) {
    return false;
  } else {
    return true;
  }
};
BerletSchema.methods.hasznal = function (resztvevo, cb) {
  if (typeof this.ownerDocument === 'undefined') {
    throw Error('Berlet should always have a Jogas as parent');
  }
  if (this.isValid()) {
    this.felhasznalva.push({
      resztvevo: resztvevo._id,
      alkalom: resztvevo.alkalom
    });
    this.ownerDocument().save(cb);
  } else {
    cb(new Error('A berlet nem ervenyes'));
  }
};
BerletSchema.methods.restore = function (alkalom, cb) {
  if (typeof this.ownerDocument === 'undefined') {
    throw Error('Berlet should always have a Jogas as parent');
  }
  this.felhasznalva = _.reject(this.alkalmak, {alkalom: alkalom});
  this.ownerDocument().save(cb);
};

var JogasSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String
  },
  nick: {
    type: String
  },
  email: {
    type: String
  },
  city: {
    type: String
  },
  berletek: [BerletSchema],
  note: {
    type: String
  }
});

/**
 * Validations
 */
JogasSchema.path('name').validate(function (name) {
  return name.length;
}, 'Name cannot be blank');

JogasSchema.virtual('berlet').get(function () {
  var berlet = false;
  for (var i = 0; i < this.berletek.length; i++) {
    if (this.berletek[i].isValid()) {
      berlet = this.berletek[i];
      break;
    }
  }
  return berlet;
});

mongoose.model('Berlet', BerletSchema);
mongoose.model('Jogas', JogasSchema);
