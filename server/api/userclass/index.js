'use strict';

var express = require('express');
var controller = require('./userclass.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/last', auth.isAuthenticated(), controller.getLastClass);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

router.put('/confirm/:id', auth.isAuthenticated(), controller.confirmClassRequest);
router.put('/deny/:id', auth.isAuthenticated(), controller.denyClassRequest);

router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
