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
	  		name: $rootScope.currentUser.name.firstName + ' ' + $rootScope.currentUser.name.lastName,
	  		bankName: null,
	  		branchName: null,
	  		accounNumber: null,
	  		bankDetails: null
	  	}
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
		$scope.addBankAccountProgress = true;
		$scope.addBankAccountFormData.start = parseInt($scope.selectedStartYear);
		$scope.addBankAccountFormData.end = parseInt($scope.selectedEndYear);
		userFactory.updateBankAccount($scope.addBankAccountFormData._id, $scope.addBankAccountFormData)
		.success(function(response){
			$scope.addBankAccountProgress = false;
		})
		.error(function(err){
			$scope.addBankAccountProgress = false;
			console.log(err);
		})
	}

  	$scope.addBranch = function(bankName){
  		if($scope.addBankAccountFormData.bankName && $scope.addBankAccountFormData.branchName){
	  		$scope.disableFields = true;
	  		var bankDetailsUrl = 'http://api.techm.co.in/api/getbank/' + encodeURIComponent($scope.addBankAccountFormData.bankName) + '/' + encodeURIComponent($scope.addBankAccountFormData.branchName);
			$http.get(bankDetailsUrl)
			.then(function(response){
				$scope.disableFields = false;
				if(response.data.status === 'success'){
					$scope.addBankAccountFormData.bankDetails = response.data.data;
				}else{
					$scope.addBankAccountFormData.branchName = null;
					$scope.addBankAccountFormData.bankName = null;
					$scope.errorMessage = "An error occured! Please try again."
				}
			})
			.catch(function(err){
				$scope.disableFields = false;
				$scope.addBankAccountFormData.branchName = null;
				$scope.addBankAccountFormData.bankName = null;
				$scope.errorMessage = "An error occured! Please try again."
			});
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
