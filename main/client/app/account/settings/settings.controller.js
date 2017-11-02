'use strict';

angular.module('takhshilaApp')
  .controller('SettingsCtrl', function ($rootScope, $scope, $mdDialog, $http, User, userFactory, Auth) {
    $scope.updateError = false;
    $scope.updateErrorMessage = null;
    $scope.bankAccounts = [];

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };

    $scope.saveSettings = function(settingsForm){
      $scope.updateError = false;
      $scope.updateError = false;
      $scope.saving = true;
      var updateData = {
        name: {
          firstName: $scope.user.name.firstName,
          lastName: $scope.user.name.lastName
        },
        email: $scope.user.email,
        phone: $scope.user.phone
      }
      userFactory.saveSettings(updateData)
      .success(function(response){
        $scope.saving = false;
        console.log(response);
        if(response.success){
          $rootScope.currentUser.name = response.data.name;
          if(response.phoneNumberUpdated){
            var parentEl = angular.element(document.body);
            $mdDialog.show({
              templateUrl: 'components/verifyOtpModal/verifyOtpModal.html',
              controller: 'VerifyOtpModalCtrl',
              parent: parentEl,
              disableParentScroll: true,
              locals: {
                userId: $rootScope.currentUser._id,
                verificationType: 'phone',
                generateToken: false
              }
            });
          }
        }else{
          $scope.updateErrorMessage = response.error;
          $scope.updateError = true;
        }
      })
      .error(function(err){
        $scope.saving = false;
        console.log(err);
      });
    }
    
    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getBankAccounts();
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
        $scope.selectedCountry = {};
        for(var i = 0; i < $rootScope.countries.length; i++){
          if($rootScope.countries[i]._id === $scope.user.country){
            $scope.selectedCountry = $rootScope.countries[i];
            break;
          }
        }
      }
    });


    $scope.getBankAccounts = function(){
      $http.get('/api/v1/bankAccounts/')
      .then(function(response){
        $scope.bankAccounts = response.data;
      }, function(err){
        console.log(err);
      });
    }

    $scope.showAddBankAccountModal = function($event, bankAccountData){
      if(bankAccountData === undefined){
        bankAccountData = null;
      }
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/addBankAccountModal/addBankAccountModal.html',
        controller: 'AddBankAccountModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: true,
        locals: {
          bankAccountData: bankAccountData
        }
      });
    }

    $scope.editBankAccount = function(index){
      var bankAccountData = $scope.bankAccounts[index];
      $scope.showAddBankAccountModal('', bankAccountData);
    }

    $scope.deleteBankAccount = function(index){
      // return userFactory.deleteBankAccount($rootScope.currentUser.experience[index]._id)
      var bankAccountData = $scope.bankAccounts[index];
      return $http.delete('/api/v1/bankAccounts/' + bankAccountData._id)
      .then(function(response){
        $rootScope.$broadcast('bankAccountDataSaved', {});
        $scope.addBankAccountProgress = false;
        $mdDialog.hide();
      }, function(err){
        $scope.addBankAccountProgress = false;
        console.log(err);
      });
    }

    $scope.confirmDeleteBankAccount = function($event, index){
      var parentEl = angular.element(document.body);
      var bankAccountData = $scope.bankAccounts[index];
      bankAccountData.index = index;
      $mdDialog.show({
        templateUrl: 'components/confirmModal/confirmModal.html',
        controller: 'ConfirmModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: false,
        locals: {          
          modalData: bankAccountData,
          modalOptions: {
            headerText: 'Confirm Delete',
            contentTitle: 'Are you sure you want to remove this bank account?',
            modalType: 'deleteBankAccount',
            confirmText: 'Delete',
            confirmClass: 'red',
            cancelClass: '',
            cancelText: 'Cancel',
            processConfirm: $scope.deleteBankAccount
          }
        }
      })
      .then(function() {
        console.log('You confirmed delete');
      }, function() {
        console.log('You cancelled delete');
      });
    }

    $rootScope.$on('bankAccountDataSaved', function(data){
      $scope.getBankAccounts();
    });
  });
