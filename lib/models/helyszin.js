var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var JogatartoSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String
    },
    joga: {
        type: Boolean
    },
    assistant: {
        type: Boolean
    }
});

mongoose.model('Jogatarto', JogatartoSchema);
