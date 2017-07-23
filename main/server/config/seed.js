/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Countries = require('../api/countries/countries.model');
var Language = require('../api/language/language.model');
var School = require('../api/school/school.model');

var countryList = require('./seedData/countries.json');
var languageList = require('./seedData/languages.json');
var schoolList = require('./seedData/universityDomain.json');


Countries
.find()
.exec(function (err, countriesFound) {
	if(countriesFound.length === 0){
		console.log("Adding countrie");
		for(var i = 0; i < countryList.length; i++){
			var countryData = {
				name: countryList[i].name,
				code: countryList[i].code.replace(/\s/g,''),
				dialCode: countryList[i].dial_code
			}
			Countries.create(countryData, function(err, addedCountry){
				if(err) { console.log("Error is: ", err); }
			})
		}		
	}
});

Language
.find()
.exec(function (err, languagesFound) {
	if(languagesFound.length === 0){
		for(var i = 0; i < languageList.length; i++){
			var languageData = {
				code: languageList[i].code,
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
				schoolName: schoolList[i].name,
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
