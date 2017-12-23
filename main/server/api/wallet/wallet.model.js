'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WalletSchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  promoBalance: {type: Number, required: true, default: 0.00},
  withdrawBalance: {type: Number, required: true, default: 0.00},
  nonWithdrawBalance: {type: Number, required: true, default: 0.00},
  totalBalance: {type: Number, required: true, default: 0.00},
  withdrawlRefrence: {type: String, ref: 'Transaction', default: null},
  active: Boolean
});

module.exports = mongoose.model('Wallet', WalletSchema);