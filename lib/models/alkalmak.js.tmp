var mongoose = require('mongoose'),
    config = require('../../config/config'),
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

AlkalomSchema.methods.addResztvevo = function(resztvevo, cb) {
    var that = this;
    this.resztvevok.push(resztvevo);
    return resztvevo.addAlkalom(this, function(jogas) {
        that.save(cb);
    });
    // return this.save(cb);
};

mongoose.model('Alkalom', AlkalomSchema);