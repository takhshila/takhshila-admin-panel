'use strict';

angular.module('takhshilaApp')
  .controller('VideoUploadModalCtrl', function ($rootScope, $scope, $timeout, $mdDialog, Upload, Auth) {
  	console.log(Upload);

	Upload.upload({
	  url: 'api/videos',
	  method: 'POST',
	  file: Upload.currentVideo
	}).then(function(data){
    console.log("Success: ",data);
  }, function(err){
    console.log("Error: ",err);
  }, function(progress){
    console.log("Progress: ",progress);
  });
    
  $scope.closeDialog = function() {
    $mdDialog.hide();
    angular.element('#uploadVideoForm')[0].reset();
    Upload.currentVideo = null;
  };
});
