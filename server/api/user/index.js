'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/settings', auth.isAuthenticated(), controller.updateSettings);
router.put('/basicinfo', auth.isAuthenticated(), controller.updateBasicInfo);
router.put('/status', auth.isAuthenticated(), controller.updateStatus);
router.put('/profilephoto', auth.isAuthenticated(), controller.updateProfilePhoto);
router.put('/rateperhour', auth.isAuthenticated(), controller.updateRatePerHour);
router.put('/password/:id', auth.isAuthenticated(), controller.changePassword);
router.put('/updatePassword', auth.isAuthenticated(), controller.updatePassword);

router.post('/specialization', auth.isAuthenticated(), controller.addSpecialization);
router.delete('/specialization/:id', auth.isAuthenticated(), controller.deleteSpecialization);

router.post('/education', auth.isAuthenticated(), controller.addEducation);
router.put('/education/:id', auth.isAuthenticated(), controller.updateEducation);
router.delete('/education/:id', auth.isAuthenticated(), controller.deleteEducation);

router.post('/experience', auth.isAuthenticated(), controller.addExperience);
router.put('/experience/:id', auth.isAuthenticated(), controller.updateExperience);
router.delete('/experience/:id', auth.isAuthenticated(), controller.deleteExperience);

router.get('/availability', auth.isAuthenticated(), controller.getCurrentUserAvailability);
router.post('/availability/:id', controller.getAvailability);
router.put('/availability', auth.isAuthenticated(), controller.updateAvailability);

// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', /*auth.isAuthenticated(),*/ controller.show);
router.get('/referral/:referralID', /*auth.isAuthenticated(),*/ controller.getReferral);

// router.post('/', controller.create);
router.post('/register', controller.sendVerificationCode);
router.post('/verifyPhoneNumber', controller.verifyPhoneNumber);
router.post('/sendOTP', controller.sendOTP);
router.post('/verifyOTP', controller.verifyOTP);

module.exports = router;
