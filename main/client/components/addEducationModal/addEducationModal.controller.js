'use strict';

angular.module('takhshilaApp')
  .controller('AddEducationModalCtrl', function ($scope, $mdDialog, $http) {
  	$scope.addEducationFormData = {
  		degree: null,
  		school: null,
  		field: null,
  		starr: null,
  		end: null
  	}
  	$scope.startYear = [];
  	$scope.endYear = [];
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
		return $http.get('/api/v1/schools/search/?schoolName'+schoolName)
			.then(function(response){
			return response.data.map(function(item){
				return item.schoolName;
			});
		});
	};

    $scope.populateStartYear();
  });
