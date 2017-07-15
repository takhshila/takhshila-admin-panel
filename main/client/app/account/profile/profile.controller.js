'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, $http, $mdDialog, Cropper, uiCalendarConfig, Upload, Auth, userFactory, videoFactory) {
    $rootScope.isLoading = false;
    $scope.demoVideos = [];
    if(Cropper.currentFile === undefined){
      Cropper.currentFile = null;
    }
  	if(Upload.currentVideo === undefined){
  		Upload.currentVideo = null;
  	}

    $scope.edit = {
      basicInfo: {
        editing: false,
        progress: false,
        data: null,
      },
      specialization: {
        editing: false,
        progress: false,
        data: null,
      },
      ratePerHour: {
        editing: false,
        progress: false,
        data: null
      }
    }

    var weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

    var availability = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednessday: [],
      thursday: [],
      friday: [],
      saturday: []
    }

    $scope.getUserVideos = function(){
      videoFactory.getUserVideos($rootScope.currentUser._id)
      .success(function(response){
        $scope.demoVideos = response;
      })
      .error(function(err){
        console.log(err);
      })
    }

    $scope.showVideoModal = function(index){
      console.log("videoClicked", index);
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/videoPlayerModal/videoPlayerModal.html',
        controller: 'VideoPlayerModalCtrl',
        parent: parentEl,
        disableParentScroll: true,
        clickOutsideToClose: true,
        locals: {
          index: index,
          videos: $scope.demoVideos
        }
      });
    }

    $scope.getEvents = function(start, end, callback){
      userFactory.getCurrentUserAvailability()
      .success(function(response){
        $scope.events.length = 0;
        for(var day in response){
          for(var i = 0; i < response[day].length; i++){
            var _weekDayCount = weekDays.indexOf(day);
            var _startTime = moment(response[day][i].start, 'HH:mm').format('HH:mm');
            var _endTime = moment(response[day][i].end, 'HH:mm').format('HH:mm');

            var _startDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount, 'days').format('MMM DD, YYYY');
            if(_endTime == "00:00"){
              var _endDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount+1, 'days').format('MMM DD, YYYY');
            }else{
              var _endDate = moment(start, 'ddd MMM DD YYYY').add(_weekDayCount, 'days').format('MMM DD, YYYY');
            }
            $scope.events.push({
              start: moment(_startDate + _startTime, 'MMM DD, YYYY HH:mm'),
              end: moment(_endDate + _endTime, 'MMM DD, YYYY HH:mm')
            });
          }
        }
        checkConnectedTime();
        console.log($scope.events);
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('rerenderEvents');
      })
      .error(function(err){
        console.log(err);
      });
    }

    $scope.events = [];
    $scope.eventSources = [$scope.events, $scope.getEvents];

    var checkConnectedTime = function(){
      $scope.events.sort(function(a, b){
        return a.start.valueOf() - b.start.valueOf();
      });
      for(var i = $scope.events.length - 1; i >= 0; i--){
        if($scope.events[i-1] !== undefined){
          if($scope.events[i].start.valueOf() == $scope.events[i-1].end.valueOf()){
            $scope.events[i-1].end = $scope.events[i].end;
            var _removedEvent = $scope.events.splice(i, 1);
          }
        }
      }
    }

    var eventResize = function(event){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      $scope.events[_index].start = event.start;
      $scope.events[_index].end = event.end;
      checkConnectedTime();
    }

    var alertEventOnClick = function(event){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      $scope.events.splice(_index, 1);
    }

    var eventDrop = function(event, dayDelta, minuteDelta){
      var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);
      if(_index > -1){
        $scope.events[_index].start = moment(event.start, 'MMM DD, YYYY HH:mm');
        $scope.events[_index].end = moment(event.end, 'MMM DD, YYYY HH:mm');
        $timeout(function(){
          checkConnectedTime();
        },200);
      }
    }

    var dayClicked = function(datetime){
      var _start = moment(datetime, 'MMM DD, YYYY HH:mm');
      var _end = moment(datetime.add(30, 'minutes'), 'MMM DD, YYYY HH:mm');
      $scope.events.push({
        description: "",
        className: "",
        icon: "",
        allDay: false,
        start: _start,
        end: _end
      });
      checkConnectedTime();
      $('#availabilityCalendar').fullCalendar('rerenderEvents');
    }

    $scope.uiConfig = {
      calendar:{
        height: 750,
        editable: true,
        header:{
          left: '',
          center: 'title',
          right: 'today prev,next'
          // right: ''
        },
        defaultView: 'agendaWeek',
        eventOverlap: false,
        eventStartEditable: true,
        eventClick: alertEventOnClick,
        dayClick: dayClicked,
        eventResize: eventResize,
        eventDrop: eventDrop
      }
    }

    $scope.updateAvailability = function(){
      for(var i = 0; i < $scope.events.length; i++){
        console.log($scope.events[i].start);
        $scope.events[i].start = moment($scope.events[i].start, 'MMM DD, YYYY HH:mm').format();
        $scope.events[i].end = moment($scope.events[i].end, 'MMM DD, YYYY HH:mm').format();
      }
      console.log($scope.events);
      userFactory.updateAvailability({availability: $scope.events})
      .success(function(response){
        // $scope.getEvents();
        console.log(response);
      })
      .error(function(err){
        console.log(err);
      });
    }

    $scope.uploadProfilePic = function(){
      angular.element('#uploadProfilePic').trigger('click');
    }
  	$scope.uploadVideo = function(){
  		angular.element('#uploadVideo').trigger('click');
  	}

    $scope.onFile = function(blob) {
      Cropper.currentFile = blob;
      $rootScope.showProfilePicModal();
    }
    $scope.onVideoSelect = function(videoFile) {
      Upload.currentVideo = videoFile;
      $rootScope.showVideoUploadModal();
    }
  	$scope.editVideo = function(index) {
  		$rootScope.showVideoUploadModal('', $scope.demoVideos[index]);
  	}
    $scope.deleteVideo = function(index){
      return videoFactory.deleteVideo($scope.demoVideos[index]._id);
    }
    $scope.confirmDeleteVideo = function($event, index){
      var parentEl = angular.element(document.body);
      var videoData = $scope.demoVideos[index];
      videoData.index = index;

      $mdDialog.show({
        templateUrl: 'components/confirmModal/confirmModal.html',
        controller: 'ConfirmModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: false,
        locals: {          
          modalData: videoData,
          modalOptions: {
            headerText: 'Confirm Delete',
            contentTitle: 'Are you sure you want to remove this video?',
            modalType: 'deleteVideo',
            confirmText: 'Delete',
            confirmClass: 'red',
            cancelClass: '',
            cancelText: 'Cancel',
            processConfirm: $scope.deleteVideo
          }
        }
      })
      .then(function() {
        console.log('You confirmed delete');
      }, function() {
        console.log('You cancelled delete');
      });
    }

    $scope.editBasicInfo = function(evt){
      angular.element(evt.currentTarget).addClass('ng-hide');
      $scope.edit.basicInfo.editing = true;
      $scope.edit.basicInfo.data = $scope.currentUser.basicInfo;
    }
    $scope.saveBasicInfo = function(){
      if($scope.edit.basicInfo.data !== $scope.currentUser.basicInfo && $scope.edit.basicInfo.data !== null){
        $scope.edit.basicInfo.progress = true;
        userFactory.updateBasicInfo({basicInfo: $scope.edit.basicInfo.data})
        .success(function(response){
          $scope.edit.basicInfo.progress = false;
          $scope.currentUser.basicInfo = response.basicInfo;
          console.log(response);
          $scope.edit.basicInfo.editing = false;
        })
        .error(function(err){
          $scope.edit.basicInfo.progress = false;
          console.log(err);
        });
      }
    }
    $scope.cancelEditBasicInfo = function(){
      $scope.edit.basicInfo.editing = false;
      $scope.edit.basicInfo.data = null;
    }

    $scope.editRatePerHour = function(evt){
      angular.element(evt.currentTarget).addClass('ng-hide');
      $scope.edit.ratePerHour.editing = true;
      $scope.edit.ratePerHour.data = {
        currency: $scope.currentUser.ratePerHour.currency,
        value: $scope.currentUser.ratePerHour.value
      };
    }
    $scope.saveRatePerHour = function(){
      if(($scope.edit.ratePerHour.data.value === $scope.currentUser.ratePerHour.value && $scope.edit.ratePerHour.data.currency === $scope.currentUser.ratePerHour.currency) || !isNaN($scope.edit.ratePerHour.data.value)){
        $scope.edit.ratePerHour.progress = true;
        userFactory.updateRatePerHour({ratePerHour: $scope.edit.ratePerHour.data})
        .success(function(response){
          $scope.edit.ratePerHour.progress = false;
          $scope.currentUser.ratePerHour = response.ratePerHour;
          console.log(response);
          $scope.edit.ratePerHour.editing = false;
        })
        .error(function(err){
          $scope.edit.ratePerHour.progress = false;
          console.log(err);
        });
      }else{
        console.log("Inavlid value", $scope.edit.ratePerHour);
      }
    }
    $scope.cancelEditRatePerHour = function(){
      $scope.edit.ratePerHour.editing = false;
      $scope.edit.ratePerHour.data = null;
    }

    $scope.editSpecialization = function(evt){
      angular.element(evt.currentTarget).addClass('ng-hide');
      $scope.edit.specialization.editing = true;
      $scope.edit.specialization.data = [{
        topic: '',
        topicName: '',
        level: 'Basic',
        loadingResults: false
      }];
    }
    $scope.saveSpecialization = function(){
      var error = false;
      if(!error){
        $scope.edit.specialization.progress = true;
        var specializationData  = $scope.edit.specialization.data.map(function(item){
          return {
            topicName: item.topicName,
            level: item.level
          }
        });
        userFactory.addSpecialization(specializationData)
        .success(function(response){
          $scope.edit.specialization.progress = false;
          $scope.currentUser.specialization = response;
          $scope.edit.specialization.editing = false;
        })
        .error(function(err){
          $scope.edit.specialization.progress = false;
          console.log(err);
        });
      }
    }
    $scope.cancelEditSpecialization = function(evt){
      angular.element('.specialization-container').find('a.topic-delete').addClass('ng-hide');
      $scope.edit.specialization.editing = false;
      $scope.edit.specialization.data = null;
    }
    $scope.addSpecialization = function(){
      $scope.edit.specialization.data.push({
        topic: '',
        topicName: '',
        level: 'Basic',
        loadingResults: false
      });
    }
    $scope.removeSpecialization = function(){
      $scope.edit.specialization.data.pop();
    }
    $scope.deleteSpecialization = function(evt, index, id){
      angular.element(evt.currentTarget).find('i.remove').addClass('ng-hide');
      $scope.currentUser.specialization[index].progress = true;
      userFactory.deleteSpecialization(id)
      .success(function(response){
        $scope.currentUser.specialization[index].progress = false;
        delete $scope.currentUser.specialization.splice(index, 1);
        console.log(response);
        console.log($scope.currentUser.specialization);
      })
      .error(function(err){
        $scope.currentUser.specialization[index].progress = false;
        console.log(err);
      });
    }
    $scope.setLevel = function(index, level){
      $scope.edit.specialization.data[index].level = level;
    }

    $scope.editEducation = function(index){
      var edducationData = $rootScope.currentUser.education[index];
      console.log(edducationData);
      $scope.showAddEducationModal('', edducationData);
    }

    $scope.deleteEducation = function(index){
      return userFactory.deleteEducation($rootScope.currentUser.education[index]._id)
    }

    $scope.confirmDeleteEducation = function($event, index){
      var parentEl = angular.element(document.body);
      var educationData = $rootScope.currentUser.education[index];
      educationData.index = index;
      $mdDialog.show({
        templateUrl: 'components/confirmModal/confirmModal.html',
        controller: 'ConfirmModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: false,
        locals: {          
          modalData: educationData,
          modalOptions: {
            headerText: 'Confirm Delete',
            contentTitle: 'Are you sure you want to remove this education?',
            modalType: 'deleteEducation',
            confirmText: 'Delete',
            confirmClass: 'red',
            cancelClass: '',
            cancelText: 'Cancel',
            processConfirm: $scope.deleteEducation
          }
        }
      })
      .then(function() {
        console.log('You confirmed delete');
      }, function() {
        console.log('You cancelled delete');
      });
    }


    $scope.showAddEducationModal = function($event, educationData){
      if(educationData === undefined){
        educationData = null;
      }
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/addEducationModal/addEducationModal.html',
        controller: 'AddEducationModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: true,
        locals: {
          educationData: educationData
        }
      });
    }

    $scope.getLocation = function(index, searcTerm) {
      $scope.edit.specialization.data[index].loadingResults = true;
      return $http.get('/api/v1/topics/search/'+searcTerm).then(function(response){
        $scope.edit.specialization.data[index].loadingResults = false;
        return response.data.map(function(item){
          return item.topicName;
        });
      });
    };

    $rootScope.$on('videoDataSaved', function(data){
      $scope.getUserVideos();
    });

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $scope.getUserVideos();
      }
    });

  });
