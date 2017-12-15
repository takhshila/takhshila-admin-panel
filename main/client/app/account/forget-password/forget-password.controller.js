'use strict';

angular.module('takhshilaApp')
  .controller('ForgetPasswordCtrl', function ($rootScope, $scope, $state, $stateParams, $mdDialog, $http, Auth, $location, $window) {
  	$rootScope.isLoading = false;
  	$scope.sendOTPError = false;
    $scope.sendOTPFormData = {
      phone: null
    }

  	$scope.sendOTP = function(sendOTPForm){
  		$scope.sendOTPError = false;
  		if(sendOTPForm.$invalid){
			var el = angular.element("[name='" + sendOTPForm.$name + "']").find('.ng-invalid:visible:first');
			var elName = el[0].name;
			sendOTPForm[elName].$dirty = true;
			sendOTPForm[elName].$pristine = false;
			angular.element("[name='" + sendOTPForm.$name + "']").find('.ng-invalid:visible:first').focus();
			return false;
  		}else{
  			$scope.sendingOTP = true;
	        var sendOTPData = {
	          phone: $scope.sendOTPFormData.phone,
	          dialCode: $scope.selectedCountry.dialCode
	        }
	        Auth.sendOTP(sendOTPData)
	        .then(function(data){
	        	if(data.success){
					var parentEl = angular.element(document.body);
					$mdDialog.show({
						templateUrl: 'components/verifyOtpModal/verifyOtpModal.html',
						controller: 'VerifyOtpModalCtrl',
						parent: parentEl,
						disableParentScroll: true,
						clickOutsideToClose: false,
						locals: {
							userId: data.id,
							verificationType: 'otp',
							generateToken: true
						},
						onRemoving: function (event, removePromise) {
							removePromise
							.then(function(){
								$scope.sendingOTP = false;
								if($rootScope.loggedIn){
									$state.go('update-password');
								}
							})
							.catch(function(err){
								console.log(err);
							});
						}
					});
	        	}else{
	        		$scope.sendOTPError = true;
	        		$scope.sendOTPErrorMessage = data.error;
	        	}
	        })
	        .catch(function(err){
		          $scope.sendingOTP = false;
		          for(var error in err.errors){
		            sendOTPForm[error].$valid = false;
		            sendOTPForm[error].$invalid = true;
		            sendOTPForm[error].$error.serverError = true;
		            $scope.sendOTPErrorMessage = err.errors[error];
		            angular.element("[name='" + sendOTPForm.$name + "'] [name='" + error + "']").focus();
		          }
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
