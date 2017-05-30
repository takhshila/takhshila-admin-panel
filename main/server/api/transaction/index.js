'use strict';

var express = require('express');
var controller = require('./transaction.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/payment/initiate', auth.isAuthenticated(), controller.initiatePayment);
router.post('/payment/update', controller.updatePayment);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;