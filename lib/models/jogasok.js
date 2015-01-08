var mongoose = require('mongoose'),
  moment = require('moment'),
  Schema = mongoose.Schema;


var BerletSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  alkalmak: {
    type: Number,
    min: 0,
    default: 0
  },
  felhasznalva: [{type: Date}]
});
BerletSchema.pre('save', function (next) {
  if ((this.startDate || this.endDate) &&
    moment(this.startDate).isBefore(this.endDate)) {
    next(new Error('Start date should be before end date.'));
  } else {
    next();
  }
}, 'Start date should be before end date.');
BerletSchema.methods.isValid = function () {
  var now = moment();
  if (this.alkalmak > 0 && this.felhasznalva.length >= this.alkalmak) {
    console.log('alkalmak');
    return false;
  } else if (this.alkalmak === 0 &&
    (now.isBefore(this.startDate) || moment(this.endDate).isBefore(now))) {
    return false;
  } else {
    return true;
  }
};
BerletSchema.methods.hasznal = function (alkalom, cb) {
  if (this.isValid()) {
    this.felhasznalva.push(alkalom);
    if (typeof this.ownerDocument === 'undefined') {
      this.save(cb);
    } else {
      this.ownerDocument().save(cb);
    }
  } else {
    cb(new Error('A berlet nem ervenyes'));
  }
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
  alkalmak: [
    {
      type: Date
    }
  ]
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
JogasSchema.methods.addAlkalom = function (alkalom, cb) {
  this.alkalmak.push(alkalom);
  return this.save(cb);
};

mongoose.model('Berlet', BerletSchema);
mongoose.model('Jogas', JogasSchema);