const mongoose = require('mongoose');

const debtsSchema = mongoose.Schema({
    _id : mongoose.Types.ObjectId,
    debtorFirstName : String,
    debtorLastName : String,
    debts : Number,
    lenderFirstName : String,
    lenderLastName : String
});

module.exports = mongoose.model('usersDebts', debtsSchema);