'use strict';

var express = require('express');
var controller = require('./video.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

router.delete('/delete/:id', auth.hasRole('admin'), controller.delete);
router.put('/publish/:id', auth.hasRole('admin'), controller.publish);
router.put('/unpublish/:id', auth.hasRole('admin'), controller.unpublish);
router.get('/', auth.hasRole('admin'), controller.index);

router.get('/single/:id', controller.show);
router.get('/user/:id', controller.userVideo);

router.get('/self', auth.isAuthenticated(), controller.selfVideo);
router.post('/', auth.isAuthenticated(), multipartyMiddleware, controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;