'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WalletSchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  balance: {type: Number, required: true, default: 0.00},
  active: Boolean
});

module.exports = mongoose.model('Wallet', WalletSchema);