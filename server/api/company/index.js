'use strict';

var express = require('express');
var controller = require('./company.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/', auth.hasRole('admin'), controller.create);

router.get('/search', controller.search);

router.get('/:id', controller.show);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;