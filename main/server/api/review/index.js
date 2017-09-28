'use strict';

var express = require('express');
var controller = require('./review.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(),  controller.index);
router.get('/:id', controller.show);
router.post('/:id', auth.isAuthenticated(), controller.create);

// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;