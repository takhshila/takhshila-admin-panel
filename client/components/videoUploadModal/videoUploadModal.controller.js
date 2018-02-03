'use strict';

angular.module('takhshilaApp')
  .controller('VideoUploadModalCtrl', function ($rootScope, $scope, $timeout, $mdDialog, $http, Upload, Auth, videoFactory, videoData) {
    $scope.percentCompleted = 0;
    $scope.showProgress = false;
    $scope.videoUploaded = false;
    $scope.videoProcessing = false;
    $scope.videoThumbnail = null;
    $scope.updateVideoFormData = {
      title: "Untitled",
      description: '',
      topic: null
    }
    $scope.videoData = null;
    $scope.selectedTopics = [];
    $scope.topicField = null;

    $scope.clearField = function(fieldName){
      // $scope.updateVideoForm.topic = null;
    }

    $scope.addFieldValue = function(item){
      $scope.selectedTopics.push(item);
      $scope.updateVideoFormData.topic = null;
    }

    $scope.removeFieldValue = function(index){
      $scope.selectedTopics.splice(index, 1); 
      $scope.updateVideoFormData.topic = null;
    }

    $scope.getTopics = function(index, searcTerm) {
      return $http.get('/api/v1/topics/search/'+searcTerm)
        .then(function(response){
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
        $scope.closeDialog();
        $scope.updateVideoDataProgress = false;
        $rootScope.$broadcast('videoDataSaved', {});
      }, function(err){
        $scope.updateVideoDataProgress = false;
        console.log(err);
      })
    }

    if(Upload.currentVideo !== null && videoData === null){
      $scope.showProgress = true;
      Upload.upload({
        url: 'api/v1/videos',
        method: 'POST',
        data: {file: Upload.currentVideo}
      })
      .then(function(data){
        $scope.videoUploaded = true;
        $scope.videoThumbnail = 'thumbnails/' + data.data.video.thumbnailFile;
        $scope.videoData = data.data.video;
      }, function(err){
        console.log("Error: ",err);
      }, function(progress){
        $scope.percentCompleted = parseInt(progress.loaded / progress.total * 100);
        if($scope.percentCompleted === 100){
          $scope.videoProcessing = true;
        }
        console.log("Completed: " + $scope.percentCompleted);
      });
    }else{
      $scope.videoData = videoData;
      $scope.updateVideoFormData.title = videoData.title;
      $scope.updateVideoFormData.description = videoData.description;
      $scope.videoThumbnail = 'thumbnails/' + videoData.thumbnailFile;
      for(var i = 0; i < videoData.topics.length; i++){
        $scope.addFieldValue(videoData.topics[i]);
      }
    }
});
