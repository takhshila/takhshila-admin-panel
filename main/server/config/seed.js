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
// var User = require('../api/user/user.model');

// Thing.find({}).remove(function() {
//   Thing.create({
//     name : 'Development Tools',
//     info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
//   }, {
//     name : 'Server and Client integration',
//     info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
//   }, {
//     name : 'Smart Build System',
//     info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
//   },  {
//     name : 'Modular Structure',
//     info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
//   },  {
//     name : 'Optimized Build',
//     info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
//   },{
//     name : 'Deployment Ready',
//     info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
//   });
// });

Countries.find({}).remove(function() {
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
	// Countries.collection.insertMany(jsonList, function(err) {
	//   console.log("Error is: ", err);
	//   console.log('finished populating countries');
	// });
});

Language.find({}).remove(function() {
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
});

School.find({}).remove(function() {
	for(var i = 0; i < languageList.length; i++){
		var schoolData = {
			schoolName: languageList[i].name,
			countryCode: languageList[i].alpha_two_code,
			countryName: languageList[i].country,
			website: languageList[i].web_page
		}
		School.create(schoolData, function(err, addedSchool){
			if(err) { console.log("Error is: ", err); }
		})
	}
});