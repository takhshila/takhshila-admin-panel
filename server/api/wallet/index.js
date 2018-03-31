'use strict';

var express = require('express');
var controller = require('./wallet.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/balance', auth.isAuthenticated(), controller.getBalance);

router.get('/', auth.hasRole('admin'), controller.index);
// router.get('/:id', auth.hasRole('admin'), controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;