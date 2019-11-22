const mongoose = require('mongoose');

const commandSchema = mongoose.Schema({
    _id : mongoose.Types.ObjectId,
    command_name : String,
    description : String
});

module.exports = mongoose.model('Commands', commandSchema);