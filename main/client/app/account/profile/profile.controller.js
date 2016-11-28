'use strict';

angular.module('takhshilaApp')
  .controller('ProfileCtrl', function ($rootScope, $scope, $timeout, Cropper, uiCalendarConfig, Upload, Auth) {
    if(Cropper.currentFile === undefined){
      Cropper.currentFile = null;
    }
  	if(Upload.currentVideo === undefined){
  		Upload.currentVideo = null;
  	}

    var weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

    var availability = {
      repeat: true,
      sunday: [],
      monday: [],
      tuesday: [],
      wednessday: [],
      thursday: [],
      friday: [],
      saturday: []
    }

    $scope.events = [];

    $scope.eventSources = [$scope.events];

    $scope.renderView = function(view){
      $scope.events.length = 0;
      console.log("renderView Called");
      console.log($scope.events);
      if(view === undefined){
        view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
      }
      var date = new Date(view.start._d);
      var d = date.getDate();
      var m = date.getMonth();
      var y = date.getFullYear();
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        for(var i = 0; i < availability[weekDays[dayIndex]].length; i++){
          $scope.events.push({
            title: 'Available',
            start: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute),
            end: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute),
            allDay: false,
            dayIndex: dayIndex,
            availabilityIndex: i,
            color: '#5cb85c'
          });
        }
      }
      if(uiCalendarConfig.calendars["availabilityCalendar"]){
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('refetchEvents');
      }
    }

    $scope.eventResize = function(event){
      var dayIndex = event.dayIndex;
      var i = event.availabilityIndex;
      availability[weekDays[dayIndex]][i].endHour = event.end.get('hour');
      availability[weekDays[dayIndex]][i].endMinute = event.end.get('minute');
    }

    $scope.eventDrop = function(event){
      var startDay = new Date(event.start._i).getDay();
      var endDay = new Date(event.start._d).getDay();

      if(startDay == endDay){
        var dayIndex = event.dayIndex;
        var i = event.availabilityIndex;
        availability[weekDays[dayIndex]][i].endHour = event.end.get('hour');
        availability[weekDays[dayIndex]][i].endMinute = event.end.get('minute');
      }else{
        var dayIndex = event.dayIndex;
        var i = event.availabilityIndex;

        var startHour = event.start.get('hour');
        var startMinute = event.start.get('minute');
        var endHour = event.end.get('hour');
        var endMinute = event.end.get('minute');

        var removedEvent = availability[weekDays[dayIndex]].splice(i, 1);

        availability[weekDays[endDay]].push({
          startHour: startHour,
          startMinute: startMinute,
          endHour: endHour,
          endMinute: endMinute
        });
      }
    }

    $scope.dayClicked = function(datetime){
      // $scope.events.length = 0;
      var clickedDateTime = new Date(datetime._i[0], datetime._i[1], datetime._i[2], datetime._i[3], datetime._i[4]);
      var day = clickedDateTime.getDay();
      var startHour = datetime._i[3];
      var startMinute = datetime._i[4];
      var endHour, endMinute = 0;
      if(startMinute > 0){
        endHour = startHour + 1;
        endMinute = 0;
      }else{
        endHour = startHour;
        endMinute = startMinute + 30;
      }
      availability[weekDays[day]].push({
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute
      });
      $scope.renderView();
    }

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: '',
          center: '"Weekly Scheduler"',
          right: 'today prev,next'
        },
        defaultView: 'agendaWeek',
        eventOverlap: false,
        // eventStartEditable: false,
        eventClick: $scope.alertEventOnClick,
        dayClick: $scope.dayClicked,
        eventResize: $scope.eventResize,
        eventDrop: $scope.eventDrop,
        viewRender: $scope.renderView
      }
    };

    $scope.uploadProfilePic = function(){
      angular.element('#uploadProfilePic').trigger('click');
    }
  	$scope.uploadVideo = function(){
  		angular.element('#uploadVideo').trigger('click');
  	}

    $scope.onFile = function(blob) {
      Cropper.currentFile = blob;
      $rootScope.showProfilePicModal();
    };
  	$scope.onVideoSelect = function(videoFile) {
      Upload.currentVideo = videoFile;
  		$rootScope.showVideoUploadModal();
  	};
  });
