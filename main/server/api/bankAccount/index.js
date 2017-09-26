'use strict';

var express = require('express');
var controller = require('./bankAccount.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.getBankAccounts);
router.post('/', auth.isAuthenticated(), controller.addBankAccount);
router.put('/:id', auth.isAuthenticated(), controller.updateBankAccount);
router.delete('/:id', auth.isAuthenticated(),controller.deleteBankAccount);

// router.get('/:id', controller.show);
// router.post('/', controller.create);
// router.patch('/:id', controller.update);

module.exports = router;