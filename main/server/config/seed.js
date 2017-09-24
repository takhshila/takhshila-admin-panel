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


// var bankTableData = [];

// var headers = {
//     'User-Agent':       'Super Agent/0.0.1',
//     'Content-Type':     'application/json'
// }

// var options = {
//     url: 'https://api.techm.co.in/api/listbanks',
//     method: 'GET',
//     headers: headers,
//     // qs: queryParams
// }

// request(options, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//   		var body = JSON.parse(body);
//   		var promiseList = body.data.map(function(bankName){
//   			return new Promise(function(resolve, reject){
//   				getBankBranches(bankName)
//   				.then(function(){
//   					resolve();
//   				})
//   				.catch(function(){
//   					resolve();
//   				})
//   			});
//   		});
//   		Promise.all(promiseList)
//   		.then(function(){
//   			console.log("Total Data = " + bankTableData.length);
//   		})
//   		.catch(function(){
//   			console.log("Total Data = " + bankTableData.length);
//   		});
//   }else{
//     console.log("Error is: ", error);
//   }
// });


// function getBankBranches(bankName){
// 	return new Promise(function(resolve, reject){
// 		var url = 'https://api.techm.co.in/api/listbranches/' + encodeURIComponent(bankName);
// 		var headers = {
// 		    'User-Agent':       'Super Agent/0.0.1',
// 		    'Content-Type':     'application/json'
// 		}

// 		var options = {
// 		    url: url,
// 		    method: 'GET',
// 		    headers: headers,
// 		    // qs: queryParams
// 		}

// 		request(options, function (error, response, body) {
// 		  if (!error && response.statusCode == 200) {
// 		  		var body = JSON.parse(body);
// 		      for(var i = 0; i < body.data.length; i++){
// 		      	var branchName = body.data[i];
// 		      	return updateBankArray(bankName, body.data[i]);
// 		      }
// 		  }else{
// 		  	resolve();
// 		    console.log("Error is: ", error);
// 		  }
// 		});
// 	});
// }


// function updateBankArray(bankName, branchName){
// 	return new Promise(function(resolve, reject){
// 		var url = 'https://api.techm.co.in/api/getbank/' + encodeURIComponent(bankName) + '/' + encodeURIComponent(branchName);
// 		var headers = {
// 		    'User-Agent':       'Super Agent/0.0.1',
// 		    'Content-Type':     'application/json'
// 		}

// 		var options = {
// 		    url: url,
// 		    method: 'GET',
// 		    headers: headers,
// 		    // qs: queryParams
// 		}

// 		request(options, function (error, response, body) {
// 		  if (!error && response.statusCode == 200) {
// 		  		var body = JSON.parse(body);
// 		      	var bankData = {};
// 		      	for(var key in body.data){
// 		      		if(key !== '_id' &&  key !== 'MIRCODE'){
// 		      			bankData[key.toLowerCase()] = body.data[key];
// 		      		}
// 		      		bankData.mirCode = body.data.MIRCODE;
// 		      	}
// 		      	if(bankData['_id']){ delete bankData['_id'] };
// 		      	bankTableData.push(bankData);
// 		      	resolve();
// 		  }else{
// 		    console.log("Error is: ", error);
// 		    resolve();
// 		  }
// 		});
// 	});
// }