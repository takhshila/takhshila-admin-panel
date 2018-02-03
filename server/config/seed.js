/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var request = require('request');
var Countries = require('../api/countries/countries.model');
var Language = require('../api/language/language.model');
var School = require('../api/school/school.model');
var Bank = require('../api/bank/bank.model');
var User = require('../api/user/user.model');

var countryList = require('./seedData/countries.json');
var languageList = require('./seedData/languages.json');
var schoolList = require('./seedData/universityDomain.json');

var adminCountry = {};

function capitalize(str) {
  	if(str){
		str = str.toLowerCase().split(' ');
		for (var i = 0; i < str.length; i++) {
			if(str[i] !== 'of'){
				str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
			}
		}
		return str.join(' ');
  	}
}

Countries
.find()
.exec(function (err, countriesFound) {
	if(countriesFound.length === 0){
		for(var i = 0; i < countryList.length; i++){
			var countryData = {
				name: capitalize(countryList[i].name),
				code: countryList[i].code.replace(/\s/g,''),
				dialCode: countryList[i].dial_code
			}
			Countries.create(countryData, function(err, addedCountry){
				if(countryList[i].code.replace(/\s/g,'').toLowerCase() === 'in'){
					adminCountry = addedCountry;
				}
				if(err) { console.log("Error is: ", err); }
			})
		}		
	}else{
		for(var i = 0; i < countriesFound.length; i++){
			if(countriesFound[i].code.replace(/\s/g,'').toLowerCase() === 'in'){
				adminCountry = countriesFound[i];
			}
		}
	}
});

Language
.find()
.exec(function (err, languagesFound) {
	if(languagesFound.length === 0){
		for(var i = 0; i < languageList.length; i++){
			var languageData = {
				code: capitalize(languageList[i].code),
				name: languageList[i].name,
				nativeName: languageList[i].nativeName
			}
			Language.create(languageData, function(err, addedLanguage){
				if(err) { console.log("Error is: ", err); }
			})
		}		
	}
});


School
.find()
.exec(function (err, schoolsFound) {
	if(schoolsFound.length === 0){
		for(var i = 0; i < schoolList.length; i++){
			var schoolData = {
				schoolName: capitalize(schoolList[i].name),
				countryCode: schoolList[i].alpha_two_code,
				countryName: schoolList[i].country,
				website: schoolList[i].web_page
			}
			School.create(schoolData, function(err, addedSchool){
				if(err) { console.log("Error is: ", err); }
			})
		}	
	}
});

User
.find()
.exec(function (err, userList) {
	var adminExist = false;
	for(var i = 0; i < userList.length; i++){
		if(userList[i].role === 'admin'){
			adminExist = true;
			break;
		}
	}
	if(adminExist){
		console.log("Admin user exist.");
	}else{
		var adminData = {
		    "password" : "Jh@ri@123",
		    "slugName" : "welcome",
		    "provider" : "local",
		    "dialCode" : adminCountry.dialCode,
		    "country" : adminCountry._id,
		    "status" : "active",
		    "role" : "admin",
		    "profileSetup" : false,
		    "isTeacher" : true,
		    "isEmailVerified" : false,
		    "isPhoneVerified" : true,
		    "emailVerificationCode" : null,
		    "phoneVerificationCode" : null,
		    "phone" : "9599226023",
		    "tempPhone" : null,
		    "referredBy" : null,
		    "name" : {
		        "firstName" : "Takhshila",
		        "lastName" : "Technologies"
		    }
		}
		User.create(adminData, function(err, admin){
			if(err){
				console.log("Error creating admin", err);
			}else{
				console.log("Admin created");
			}
		});
	}
});
