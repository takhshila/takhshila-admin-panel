'use strict';

var express = require('express');
var controller = require('./topic.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:id', controller.show);
router.get('/search/:searchTerm', controller.search);

router.get('/', auth.hasRole('admin'), controller.index);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;