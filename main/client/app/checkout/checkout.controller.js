'use strict';

angular.module('takhshilaApp')
  .controller('CheckoutCtrl', function ($rootScope, $scope, $state, transactionFactory, cart) {
  	$rootScope.isLoading = false;
  	$scope.cartData = cart.getCart();
  	$scope.paymentData = {};

    console.log($scope.cartData);

    $scope.checkout = function(){

        for(var i = 0; i < $scope.cartData.classData.length; i++){
            $scope.cartData.classData[i].start = moment($scope.cartData.classData[i].start, 'MMM DD, YYYY HH:mm').format();
            $scope.cartData.classData[i].end = moment($scope.cartData.classData[i].end, 'MMM DD, YYYY HH:mm').format();
        }
    	var transactionData = {
    		currency: $scope.cartData.currency,
    		teacherID: $scope.cartData.teacherID,
    		classData: $scope.cartData.classData
    	}
    	transactionFactory.initiatePayment(transactionData)
    	.success(function(response){
            if(response.paymentRequired){
        		$scope.paymentData = response.paymentData;
        		$rootScope.$broadcast('processFormSubmit', {formName: 'paymentRedirect'});
            }else{
                $state.go('profile');
            }
    		// var paymentForm = angular.element('#paymentRedirect');
    		// paymentForm.click();
    		// paymentForm.triggerHandler('submit');
    	})
    	.error(function(err){
    		console.log("error");
    		console.log(err);
    	})
    }
  });
