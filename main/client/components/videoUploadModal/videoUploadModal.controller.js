'use strict';

angular.module('takhshilaApp')
  .controller('VideoUploadModalCtrl', function ($rootScope, $scope, $timeout, $mdDialog, $http, Upload, Auth, videoFactory) {
  	console.log(Upload);
    $scope.percentCompleted = 0;
    $scope.videoUploaded = false;
    $scope.videoThumbnail = null;
    $scope.updateVideoFormData = {
      title: "Untitled",
      description: '',
      topic: null
    }
    $scope.videoData = null;
    $scope.selectedTopics = [];
    $scope.topicField = null;

    Upload.upload({
      url: 'api/v1/videos',
      method: 'POST',
      file: Upload.currentVideo
    })
    .then(function(data){
      console.log("Success: ",data);
      $scope.videoUploaded = true;
      $scope.videoThumbnail = 'thumbnails/' + data.data.video.thumbnailFile;
      $scope.videoData = data.data.video;
    }, function(err){
      console.log("Error: ",err);
    }, function(progress){
      console.log("Progress: ",progress);
      $scope.percentCompleted = parseInt(progress.loaded / progress.total) * 100;
    });

    $scope.clearField = function(fieldName){
      // $scope.updateVideoForm.topic = null;
    }

    $scope.addFieldValue = function(item){
      $scope.selectedTopics.push(item);
      $scope.updateVideoFormData.topic = null;
    }

    $scope.getTopics = function(index, searcTerm) {
      return $http.get('/api/v1/topics/search/'+searcTerm)
        .then(function(response){
          console.log(response);
          return response.data.map(function(item){
            return item;
          });
      });
    };

    $scope.closeDialog = function() {
      $mdDialog.hide();
      angular.element('#uploadVideoForm')[0].reset();
      Upload.currentVideo = null;
    };

    $scope.updateVideoData = function(){
      $scope.updateVideoDataProgress = true;
      var videoData = {
        title: $scope.updateVideoFormData.title,
        description: $scope.updateVideoFormData.description,
        topics: []
      }
      for(var i = 0; i < $scope.selectedTopics.length; i++){
        videoData.topics.push($scope.selectedTopics[i]._id);
      }
      videoFactory.updateVideo($scope.videoData._id, videoData)
      .then(function(response){
        $scope.updateVideoDataProgress = false;
        console.log(response);
      }, function(err){
        $scope.updateVideoDataProgress = false;
        console.log(err);
      })
    }
});
