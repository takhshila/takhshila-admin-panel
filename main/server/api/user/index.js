'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/basicinfo', auth.isAuthenticated(), controller.updateBasicInfo);
router.put('/status', auth.isAuthenticated(), controller.updateStatus);
router.put('/profilephoto', auth.isAuthenticated(), controller.updateProfilePhoto);
router.put('/rateperhour', auth.isAuthenticated(), controller.updateRatePerHour);
router.put('/password/:id', auth.isAuthenticated(), controller.changePassword);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

router.post('/education', auth.isAuthenticated(), controller.addEducation);
router.put('/education/:id', auth.isAuthenticated(), controller.updateEducation);
router.delete('/education/:id', auth.isAuthenticated(), controller.deleteEducation);

router.post('/experience', auth.isAuthenticated(), controller.addExperience);
router.put('/experience/:id', auth.isAuthenticated(), controller.updateExperience);
router.delete('/experience/:id', auth.isAuthenticated(), controller.deleteExperience);

module.exports = router;
