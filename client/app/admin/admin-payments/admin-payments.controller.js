'use strict';

angular.module('takhshilaApp')
  .controller('AdminPaymentsCtrl', function ($rootScope, $scope, $http, $mdDialog) {
    $scope.payments = [];
  	$scope.updatingWithdraw = [];
    $scope.initiatingWithdraw = [];
    $scope.gettingBankData = [];
    $scope.bankAccountData = {};
    $scope.errorMessage = null;
    $scope.hasMoreData = false;

  	var currentPage = 0;
  	var dataPerPage = 20;

     var showBankAccountModal = function(userID){
      if($scope.bankAccountData[userID]){
        var bankData = $scope.bankAccountData[userID];
        var parentEl = angular.element(document.body);
        $mdDialog.show({
          templateUrl: 'components/confirmModal/confirmModal.html',
          controller: 'ConfirmModalCtrl',
          parent: parentEl,
          disableParentScroll: true,
          clickOutsideToClose: false,
          locals: {          
            modalData: bankData,
            modalOptions: {
              headerText: 'Bank Account Details',
              contentTitle: 'Bank account details for ' + bankData.name,
              modalType: 'showBankAccount'
            }
          }
        });
      }
     }
    
    $scope.getBankAccount = function(userID){
      $scope.gettingBankData[userID] = true;
      return $http.get('/api/v1/bankAccounts/' + userID)
      .then(function(response){
        $scope.gettingBankData[userID] = true;
        $scope.bankAccountData[userID] = response.data;
        showBankAccountModal(userID);
        $scope.gettingBankData[userID] = false;
      });
    }
  	
  	$scope.getPaymentWallet = function(){
  		return $http.get('/api/v1/wallets/?page=' + currentPage + '&perPage=' + dataPerPage)
  		.then(function(response){
  			$rootScope.isLoading = false;
  			$scope.payments = response.data;
  		});
  	}

    $scope.initiateWithdraw = function(userID){
      var userData = null;
      $scope.errorMessage = null;
      $scope.initiatingWithdraw[userID] = true;
      $http.post('/api/v1/transactions/withdraw/initiate/' + userID)
      .then(function(response){
        $scope.initiatingWithdraw[userID] = false;
        for(var i = 0; i < $scope.payments.length; i++){
          if($scope.payments[i].userID._id === userID){
            userData = $scope.payments[i].userID;
            $scope.payments[i].withdrawlRefrence = response;
            break;
          }
        }
        $scope.bankAccountData[userID] = response.data;
        showBankAccountModal(userID);
      })
      .catch(function(err){
        $scope.initiatingWithdraw[userID] = false;
        $scope.errorMessage = err.data;
        console.log(err);
      })
    }

    $scope.completeWithdraw = function(userID, ev){
      $scope.errorMessage = null;
      var confirm = $mdDialog.prompt()
        .title('Enter withdrawal transaction data.')
        .textContent('Please enter the IMPS refrence ID')
        .placeholder('IMPS Refrenece ID')
        .ariaLabel('IMPS Refrenece ID')
        .targetEvent(ev)
        .required(true)
        .ok('Complete')
        .cancel('Cancel');

      $mdDialog.show(confirm)
      .then(function(result) {
        $scope.updatingWithdraw[userID] = true;
        $http.post('/api/v1/transactions/withdraw/complete/' + userID, {
          impsTransactionID: result
        })
        .then(function(response){
          $scope.getPaymentWallet()
          .then(function(){
            $scope.updatingWithdraw[userID] = false;
          })
          .catch(function(err){
            console.log(err);
            $scope.updatingWithdraw[userID] = false;
          })
        })
        .catch(function(err){
          $scope.updatingWithdraw[userID] = false;
          $scope.errorMessage = err.data;
          console.log(err);
        });
      }, function() {
        console.log("Complete withdrawal cancelled")
      });
    }

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getPaymentWallet();
      }
    });
  });
