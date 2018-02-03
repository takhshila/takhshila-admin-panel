'use strict';

angular.module('takhshilaApp')
  .controller('AddBankAccountModalCtrl', function ($rootScope, $scope, $mdDialog, $http, userFactory, bankAccountData) {

  	if(bankAccountData !== null){
  		$scope.isUpdate = true;
  		$scope.modalTitle = "Update Bank Details";
	  	$scope.addBankAccountFormData = {
	  		name: $rootScope.currentUser.name.firstName + ' ' + $rootScope.currentUser.name.lastName,
	  		bankName: bankAccountData.bankName,
	  		branchName: bankAccountData.branchName,
	  		accountNumber: bankAccountData.accountNumber,
	  		bankDetails: bankAccountData.bankDetails
	  	}
  	}else{
  		$scope.isUpdate = false;
  		$scope.modalTitle = "Add Bank Account";
	  	$scope.addBankAccountFormData = {
	  		name: $rootScope.currentUser.name.firstName + ' ' + $rootScope.currentUser.name.lastName,
	  		bankName: null,
	  		branchName: null,
	  		accountNumber: null,
	  		bankDetails: null
	  	}
  	}

  	var validateBank = function(bankName, branchName){
  		return new Promise(function(resolve, reject){
	  		var bankDetailsUrl = 'http://api.techm.co.in/api/getbank/' + encodeURIComponent(bankName) + '/' + encodeURIComponent(branchName);
			$http.get(bankDetailsUrl)
			.then(function(response){
				if(response.data.status === 'success'){
					resolve(response.data.data);
				}else{
					reject("An error occured! Please try again.");
				}
			})
			.catch(function(err){
				reject("An error occured! Please try again.");
			});
  		});
  	}

	$scope.addBankAccount = function(addBankAccountForm){
		if(addBankAccountForm.$invalid){
			var el = angular.element("[name='" + addBankAccountForm.$name + "']").find('.ng-invalid:visible:first');
			var elName = el[0].name;
			addBankAccountForm[elName].$dirty = true;
			addBankAccountForm[elName].$pristine = false;
			angular.element("[name='" + addBankAccountForm.$name + "']").find('.ng-invalid:visible:first').focus();
			return false;
		}else{
			$scope.addBankAccountProgress = true;

			$http.post('/api/v1/bankAccounts/', $scope.addBankAccountFormData)
			.then(function(response){
				$rootScope.$broadcast('bankAccountDataSaved', {});
				$scope.addBankAccountProgress = false;
				$mdDialog.hide();
			}, function(err){
				$scope.addBankAccountProgress = false;
				console.log(err);
			});
		}
	}

	$scope.updateBankAccount = function(){
		if(addBankAccountForm.$invalid){
			var el = angular.element("[name='" + addBankAccountForm.$name + "']").find('.ng-invalid:visible:first');
			var elName = el[0].name;
			addBankAccountForm[elName].$dirty = true;
			addBankAccountForm[elName].$pristine = false;
			angular.element("[name='" + addBankAccountForm.$name + "']").find('.ng-invalid:visible:first').focus();
			return false;
		}else{
			$scope.addBankAccountProgress = true;
			$scope.disableFields = true;
	  		validateBank($scope.addBankAccountFormData.bankName, $scope.addBankAccountFormData.branchName)
	  		.then(function(response){
	  			$scope.disableFields = false;
	  			$scope.addBankAccountFormData.bankDetails = response;
				$http.put('/api/v1/bankAccounts/' + bankAccountData._id, $scope.addBankAccountFormData)
				.then(function(response){
					$rootScope.$broadcast('bankAccountDataSaved', {});
					$scope.addBankAccountProgress = false;
					$mdDialog.hide();
				}, function(err){
					$scope.addBankAccountProgress = false;
					console.log(err);
				});
	  		})
	  		.catch(function(err){
	  			$scope.disableFields = false;
				$scope.addBankAccountFormData.branchName = null;
				$scope.addBankAccountFormData.bankName = null;
				$scope.errorMessage = err;
	  		});
		}
	}

	$scope.addBank = function(bankName){
		$scope.addBankAccountFormData.branchName = null;
		$scope.addBankAccountFormData.accountNumber = null;
	}

  	$scope.addBranch = function(bankName){
  		if($scope.addBankAccountFormData.bankName && $scope.addBankAccountFormData.branchName){
	  		// $scope.disableFields = true;
	  		validateBank($scope.addBankAccountFormData.bankName, $scope.addBankAccountFormData.branchName)
	  		.then(function(response){
	  			$scope.disableFields = false;
	  			$scope.addBankAccountFormData.bankDetails = response;
	  		})
	  		.catch(function(err){
	  			$scope.disableFields = false;
				$scope.addBankAccountFormData.branchName = null;
				$scope.addBankAccountFormData.bankName = null;
				$scope.errorMessage = err;
	  		})
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
