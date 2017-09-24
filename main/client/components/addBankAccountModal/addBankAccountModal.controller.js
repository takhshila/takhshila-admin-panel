'use strict';

angular.module('takhshilaApp')
  .controller('AddBankAccountModalCtrl', function ($rootScope, $scope, $mdDialog, $http, userFactory, bankAccountData) {

  	if(bankAccountData !== null){
  		$scope.isUpdate = true;
  		$scope.modalTitle = "Update Bank Details";
  		$scope.addBankAccountFormData = bankAccountData;
  	}else{
  		$scope.isUpdate = false;
  		$scope.modalTitle = "Add Bank Account";
	  	$scope.addBankAccountFormData = {
	  		bankName: null,
	  		branchName: null,
	  		name: $rootScope.currentUser.name.firstName + ' ' + $rootScope.currentUser.name.lastName
	  	}
  	}

	$scope.getBankList = function(index, bankName) {
		if(bankName.length > 2){
			return $http.post('http://api.techm.co.in/api/fuzzySearchBank', {
				"bankName": bankName
			})
			.then(function(response){
				return response.data.data.map(function(item){
					return item;
				});
			});
		}
	};

	$scope.getBranchList = function(index, branchName) {
		if(branchName.length > 2){
			return $http.post('http://api.techm.co.in/api/fuzzySearchBranch', {
				"bankName": $scope.addBankAccountFormData.bankName,
				"branchName": branchName
			})
			.then(function(response){
				return response.data.data.map(function(item){
					return item;
				});
			});
		}
	};

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };
  });
