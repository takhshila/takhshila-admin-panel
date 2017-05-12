'use strict';

angular.module('takhshilaApp')
  .controller('SearchCtrl', function ($rootScope, $scope, $state, $stateParams, searchFactory) {
    $rootScope.isLoading = false;
    if(!$stateParams.topic || !$stateParams.level){
    	$state.go('main');
    }

    var searchdata = {
    	topic: $stateParams.topic,
    	level: $stateParams.level
    }

    searchFactory.search(searchdata)
    .success(function(response){
    	console.log(response);
    })
    .error(function(err){
    	console.log(err);
    })
  });
