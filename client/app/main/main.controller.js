'use strict';

angular.module('takhshilaApp')
.controller('MainCtrl', function ($rootScope, $scope, $state, $http, Auth) {
	$rootScope.isLoading = false;
	$scope.loginError = false;
	$scope.loginErrorMessage = null;
	$scope.loginFormData = {
		phone: null,
		dialCode: null,
		password: null,
	}

	$scope.validate = function(loginForm){
		$scope.loginError = false;
		if(loginForm.$invalid){
			var el = angular.element("[name='" + loginForm.$name + "']").find('.ng-invalid:visible:first');
			var elName = el[0].name;
			loginForm[elName].$dirty = true;
			loginForm[elName].$pristine = false;
			angular.element("[name='" + loginForm.$name + "']").find('.ng-invalid:visible:first').focus();
			return false;
		}else{
			$scope.logging = true;
			var loginData = {
				phone: $scope.loginFormData.phone,
				dialCode: $scope.selectedCountry.dialCode,
				password: $scope.loginFormData.password
			}
			Auth.login(loginData)
			.then(function(data){
				$scope.logging = false;
			}, function(err){
				$scope.logging = false;
				$scope.loginError = true;
				$scope.loginErrorMessage = err.message;
				angular.element("[name='" + loginForm.$name + "'] [name='email']").focus();
			})
		}
	}

	$rootScope.populateCountries()
	.then(function(){
		$scope.countries = $rootScope.countries;
		for(var i = 0; i < $scope.countries.length; i++){
			if($scope.countries[i].code === 'IN'){
				$scope.selectedCountry = $scope.countries[i];
				break;
			}
		}
	});
});
