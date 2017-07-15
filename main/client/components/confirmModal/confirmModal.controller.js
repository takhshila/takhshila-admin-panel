'use strict';

angular.module('takhshilaApp')
  .controller('ConfirmModalCtrl', function ($rootScope, $scope, $mdDialog, modalData, modalOptions) {
  	$scope.modalOptions = modalOptions;
  	$scope.modalData = modalData;
  	$scope.className = modalOptions.modalType;
  	$scope.confirmProcessing = false;
    
    $scope.closeDialog = function() {
      $mdDialog.cancel();
    };

    $scope.processConfirm = function() {
    	$scope.confirmProcessing = true;
    	modalOptions.processConfirm(modalData.index)
    	.then(function(response){
    		$rootScope.currentUser.education.splice(modalData.index, 1);
    		$mdDialog.cancel();
    	},  function(err){
    		console.log(err);
    		// $scope.confirmProcessing = false;
    	})
    };
  });
