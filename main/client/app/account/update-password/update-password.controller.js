'use strict';

angular.module('takhshilaApp')
  .controller('UpdatePasswordCtrl', function ($rootScope, $scope, $state, $mdDialog, $http, User, userFactory, Auth) {
    $scope.errors = {};
    $scope.updatePasswordError = false;
    $scope.updatePasswordErrorMessage = null;
    $scope.updatePasswordFormData = {
    	newPassword: null,
    	confirmNewPassword: null
    }

    $scope.updatePassword = function(updatePasswordForm) {
    	$scope.updatePasswordError = false;
    	if($scope.updatePasswordFormData.newPassword === $scope.updatePasswordFormData.confirmNewPassword && $scope.updatePasswordFormData.newPassword !== null){
			$scope.updatingPassword = true;
			Auth.updatePassword( $scope.updatePasswordFormData.newPassword )
			.then( function(data) {
				$state.go('profile');
			})
			.catch( function(err) {
				$scope.updatePasswordError = true;
				$scope.updatingPassword = false;
				console.log(err);
			});
    	}else{
    		$scope.updatePasswordError = true;
    		$scope.updatePasswordErrorMessage = "Password did not match."
    	}
    }

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        $scope.user = {
          name: {
            firstName: $rootScope.currentUser.name.firstName,
            lastName: $rootScope.currentUser.name.lastName
          },
          email: $rootScope.currentUser.email,
          phone: $rootScope.currentUser.phone,
          country: $rootScope.currentUser.country
        };
      }
    });
  });
