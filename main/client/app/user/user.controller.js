'use strict';

angular.module('takhshilaApp')
  .controller('UserCtrl', function ($rootScope, $scope, $stateParams, $timeout, $compile, uiCalendarConfig, userFactory) {
    $rootScope.isLoading = true;

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

    var calculateTotal = function(){
      var _totalCost = 0;
      for(var i = 0; i < $scope.selectedSessions.length; i++){
        _totalCost += $scope.selectedSessions[i].cost;
      }
      $scope.totalCost = parseFloat(_totalCost).toFixed(2);
    }

    var eventRender = function( event, element, view ) {
        // element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
        element.attr({'uib-popover': '"I have a title!"', 'popover-title': '"The title."', 'popover-trigger': "'mouseenter'"});
        // element.append('<md-tooltip md-autohide="false">Play Music</md-tooltip>');
        $compile(element)($scope);
    };

    var alertEventOnClick = function(event, element, view){
      if(angular.element(element.currentTarget).hasClass("active")){
        angular.element(element.currentTarget).removeClass("active");
      }else {
        angular.element(element.currentTarget).addClass("active");
      }
      var _selectedSessionPushed = false;
      var _selectedDate = event.start.format('ddd, MMMM Do YYYY');
      var _selectedStartHour = event.start.get('hour');
      var _selectedStartMinute = event.start.get('minute');
      var _selectedEndHour = event.end.get('hour');
      var _selectedEndMinute = event.end.get('minute');

      for(var i = 0; i < $scope.selectedSessions.length; i++){
        if($scope.selectedSessions[i].date.toString() == _selectedDate.toString()){
          if($scope.selectedSessions[i].endHour == _selectedStartHour){
            $scope.selectedSessions[i].endHour = _selectedEndHour;
            $scope.selectedSessions[i].endMinute = _selectedEndMinute;
            $scope.selectedSessions[i].endTime = event.end.format('h:mm a');
            $scope.selectedSessions[i].cost += parseFloat($scope.user.ratePerHour.value).toFixed(2);
            _selectedSessionPushed = true;
          }else if($scope.selectedSessions[i].startHour == _selectedEndHour){
            $scope.selectedSessions[i].startHour = _selectedStartHour;
            $scope.selectedSessions[i].startMinute = _selectedStartMinute
            $scope.selectedSessions[i].endTime = event.start.format('h:mm a');
            $scope.selectedSessions[i].cost += parseFloat($scope.user.ratePerHour.value).toFixed(2);
            _selectedSessionPushed = true;
          }
        }
      }
      if(!_selectedSessionPushed){
        var _session = {
          date: event.start.format('ddd, MMMM Do YYYY'),
          startHour: _selectedStartHour,
          startMinute: _selectedStartMinute,
          endHour: _selectedEndHour,
          endMinute: _selectedEndMinute,
          startTime: event.start.format('h:mm a'),
          endTime: event.end.format('h:mm a'),
          cost: parseFloat($scope.user.ratePerHour.value).toFixed(2),
          currency: $scope.user.ratePerHour.currency
        }
        $scope.selectedSessions.push(_session);
        calculateTotal();
      }
    }

    var renderView = function(view){
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        availability[weekDays[dayIndex]].sort(function(a, b){
          return a.startHour - b.startHour;
        });
      }
      disconnectTime();
      $scope.events.length = 0;
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
            title: 'Book Class Now',
            start: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute),
            end: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute),
            allDay: false,
            dayIndex: dayIndex,
            availabilityIndex: i,
            color: '#CFF1C2'
          });
        }
      }
      if(uiCalendarConfig.calendars["availabilityCalendar"]){
        uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('refetchEvents');
      }
    }

    var disconnectTime = function(){
      var _availability = {};
      var _view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
      var _date = new Date(_view.start._d);
      var _d = _date.getDate();
      var _m = _date.getMonth();
      var _y = _date.getFullYear();
      for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
        _availability[weekDays[dayIndex]] = [];
        for(var i = 0; i < availability[weekDays[dayIndex]].length ; i++){
          var _startTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute).getTime();
          var _endTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute).getTime();
          var _difference = Math.round((_endTime - _startTime) / 60000);
          if(_difference > 30){
            do {
              _availability[weekDays[dayIndex]].push({
                startHour: new Date(_startTime).getHours(),
                startMinute: new Date(_startTime).getMinutes(),
                endHour: new Date(_startTime + (30*60000)).getHours(),
                endMinute: new Date(_startTime + (30*60000)).getMinutes()
              });
              _startTime = _startTime + (30*60000);
              _difference = Math.round((_endTime - _startTime) / 60000);
            } while (_difference > 30);
          }else{
            _availability[weekDays[dayIndex]].push(availability[weekDays[dayIndex]][i]);
          }
        }
      }
      for(var day in _availability){
        availability[day] = _availability[day];
      }
    }

    $scope.events = [];
    $scope.selectedSessions = [];
    $scope.eventSources = [$scope.events];

    userFactory.getUserDetails($stateParams.ID)
    .success(function(response){
      $rootScope.isLoading = false;
      $scope.user = response;
      availability = response.availability;
      $timeout(function(){
        renderView();
        $scope.uiConfig = {
          calendar:{
            height: 450,
            editable: false,
            header:{
              left: '',
              center: 'title',
              right: 'today prev,next'
              // right: ''
            },
            defaultView: 'agendaWeek',
            eventClick: alertEventOnClick,
            eventRender: eventRender,
            viewRender: renderView
          }
        };
      }, 0)
    })
    .error(function(err){
      $rootScope.isLoading = false;
      console.log(err);
    });
  });
