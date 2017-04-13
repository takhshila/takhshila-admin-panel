'use strict';

angular.module('takhshilaApp')
  .controller('AddEducationModalCtrl', function ($scope, $mdDialog, $http) {
  	$scope.addEducationFormData = {
  		degree: null,
  		degreeId: null,
  		school: null,
  		schoolId: null,
  		field: null,
  		starr: null,
  		end: null
  	}
  	$scope.startYear = [];
  	$scope.endYear = [];

  	$scope.clearField = function(fieldName){
  		$scope.addEducationFormData[fieldName] = null;
  	}
  	$scope.addFieldValue = function(item, fieldName){
  		$scope.addEducationFormData[fieldName] = item._id;
  	}
  	$scope.populateStartYear = function(){
	  	for(var i = 1990; i < 2016; i++){
	  		$scope.startYear.push({
	  			value: i
	  		})
	  	}
  	}
  	$scope.populateEndYear = function(){
  		if($scope.addEducationFormData.start){
		  	for(var i = $scope.addEducationFormData.start; i < 2020; i++){
		  		$scope.endYear.push({
		  			value: i
		  		})
		  	}
  		}
  	}
    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

	$scope.getSchools = function(index, schoolName) {
		return $http.get('/api/v1/schools/search?schoolName='+schoolName)
			.then(function(response){
			return response.data.map(function(item){
				return item;
			});
		});
	};
	$scope.getDegree = function(index, degreeName) {
		return $http.get('/api/v1/degrees/search?degreeName='+degreeName)
			.then(function(response){
			return response.data.map(function(item){
				return item;
			});
		});
	};

	$scope.addEducation = function(){
		console.log($scope.addEducationFormData);
	}

    $scope.populateStartYear();
  });
