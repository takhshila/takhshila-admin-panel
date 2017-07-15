'use strict';

angular.module('takhshilaApp')
  .controller('AddEducationModalCtrl', function ($rootScope, $scope, $mdDialog, $http, userFactory, educationData) {
  	var maxYear = new Date().getFullYear();
  	$scope.selectedStartYear = null;
  	$scope.selectedEndYear = null;
  	if(educationData !== null){
  		$scope.isUpdate = true;
  		$scope.modalTitle = "Update Education";
  		$scope.addEducationFormData = educationData;
  		$scope.selectedStartYear = educationData.start;
  		$scope.selectedEndYear = educationData.end;
  		console.log(educationData);
  	}else{
  		$scope.isUpdate = false;
  		$scope.modalTitle = "Add Education";
	  	$scope.addEducationFormData = {
	  		degreeName: null,
	  		degreeId: null,
	  		schoolName: null,
	  		schoolId: null,
	  		field: null,
	  		start: null,
	  		end: null
	  	}
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
	  	for(var i = 1990; i < maxYear; i++){
	  		$scope.startYear.push({
	  			value: i,
	  			id: 'start-' + i
	  		})
	  	}
	  	if($scope.updateEducation){
	  		$scope.populateEndYear();
	  	}
  	}
  	$scope.populateEndYear = function(){
  		$scope.endYear = [];
  		if($scope.selectedStartYear){
		  	for(var i = $scope.selectedStartYear; i < (maxYear + 5); i++){
		  		$scope.endYear.push({
		  			value: i,
		  			id: 'end-' + i
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
		$scope.addEducationProgress = true;
		$scope.addEducationFormData.start = $scope.selectedStartYear;
		$scope.addEducationFormData.end = $scope.selectedEndYear;
		userFactory.addEducation($scope.addEducationFormData)
		.success(function(response){
			$rootScope.currentUser.education = response;
			$scope.addEducationProgress = false;
			$mdDialog.hide();
		})
		.error(function(err){
			$scope.addEducationProgress = false;
			console.log(err);
		})
	}

	$scope.updateEducation = function(){
		$scope.addEducationProgress = true;
		$scope.addEducationFormData.start = $scope.selectedStartYear;
		$scope.addEducationFormData.end = $scope.selectedEndYear;
		userFactory.updateEducation($scope.addEducationFormData._id, $scope.addEducationFormData)
		.success(function(response){
			$scope.addEducationProgress = false;
		})
		.error(function(err){
			$scope.addEducationProgress = false;
			console.log(err);
		})
	}

    $scope.populateStartYear();
  });
