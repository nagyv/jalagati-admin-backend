var mongoose = require('mongoose'),
    _ = require('lodash'),
    Schema = mongoose.Schema;

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
    resztvevok: [{
        type: Schema.ObjectId,
        ref: 'Jogas'
    }]
});

/**
 * Validations
 */
AlkalomSchema.path('starts').validate(function(starts) {
    return starts.length;
}, 'Date cannot be blank');

AlkalomSchema.path('tartja').validate(function(tartja) {
    return tartja.length;
}, 'Jogatarto cannot be blank');

AlkalomSchema.path('location').validate(function(location) {
    return location.length;
}, 'Helyszín cannot be blank');

AlkalomSchema.methods.addResztvevo = function(resztvevo, cb) {
    var that = this;
    this.resztvevok.push(resztvevo._id);
    return resztvevo.addAlkalom(this, function(/*jogas*/) {
        that.save(cb);
    });
};

AlkalomSchema.methods.removeResztvevo = function(resztvevo, cb) {
  var that = this;
  this.resztvevok = _.reject(this.resztvevok, {_id: resztvevo._id});
  resztvevo.removeAlkalom(this, function(/*jogas*/){
    that.save(cb);
  });
};

mongoose.model('Alkalom', AlkalomSchema);
