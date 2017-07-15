'use strict';

angular.module('takhshilaApp')
  .controller('AddExperienceModalCtrl', function ($rootScope, $scope, $mdDialog, $http, userFactory, experienceData) {
  	var maxYear = new Date().getFullYear();
  	$scope.selectedStartYear = null;
  	$scope.selectedEndYear = null;
  	if(experienceData !== null){
  		$scope.isUpdate = true;
  		$scope.modalTitle = "Update Experience";
  		$scope.addExperienceFormData = experienceData;
  		$scope.selectedStartYear = experienceData.start;
  		$scope.selectedEndYear = experienceData.end;
  	}else{
  		$scope.isUpdate = false;
  		$scope.modalTitle = "Add Experience";
	  	$scope.addExperienceFormData = {
	  		designation: null,
	  		companyName: null,
	  		companyId: null,
	  		start: null,
	  		end: null
	  	}
  	}
  	$scope.startYear = [];
  	$scope.endYear = [];

  	$scope.clearField = function(fieldName){
  		$scope.addExperienceFormData[fieldName] = null;
  	}
  	$scope.addFieldValue = function(item, fieldName){
  		$scope.addExperienceFormData[fieldName] = item._id;
  	}
  	$scope.populateStartYear = function(){
	  	for(var i = 1990; i < maxYear + 1; i++){
	  		$scope.startYear.push({
	  			value: i,
	  			id: 'start-' + i
	  		})
	  	}
	  	if($scope.updateExperience){
	  		$scope.populateEndYear();
	  	}
  	}
  	$scope.populateEndYear = function(){
  		$scope.endYear = [];
  		if($scope.selectedStartYear){
		  	for(var i = $scope.selectedStartYear; i < (maxYear + 1); i++){
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

	$scope.getCompany = function(index, companyName) {
		return $http.get('/api/v1/company/search?companyName='+companyName)
			.then(function(response){
			return response.data.map(function(item){
				return item;
			});
		});
	};

	$scope.addExperience = function(){
		$scope.addExperienceProgress = true;
		$scope.addExperienceFormData.start = $scope.selectedStartYear;
		$scope.addExperienceFormData.end = $scope.selectedEndYear;
		userFactory.addExperience($scope.addExperienceFormData)
		.success(function(response){
			$rootScope.currentUser.experience = response.experience;
			$scope.addExperienceProgress = false;
			$mdDialog.hide();
		})
		.error(function(err){
			$scope.addExperienceProgress = false;
			console.log(err);
		})
	}

	$scope.updateExperience = function(){
		$scope.addExperienceProgress = true;
		$scope.addExperienceFormData.start = parseInt($scope.selectedStartYear);
		$scope.addExperienceFormData.end = parseInt($scope.selectedEndYear);
		userFactory.updateExperience($scope.addExperienceFormData._id, $scope.addExperienceFormData)
		.success(function(response){
			$scope.addExperienceProgress = false;
		})
		.error(function(err){
			$scope.addExperienceProgress = false;
			console.log(err);
		})
	}

    $scope.populateStartYear();
  });
