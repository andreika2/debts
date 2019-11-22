const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id : mongoose.Types.ObjectId,
    firstName : String,
    lastName : String
});

module.exports = mongoose.model('Users', userSchema);