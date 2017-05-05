'use strict';

angular.module('takhshilaApp')
  .controller('VideoPlayerModalCtrl', function ($scope, $mdDialog) {

	  $scope.closeDialog = function() {
	    $mdDialog.hide();
	  };
  });
