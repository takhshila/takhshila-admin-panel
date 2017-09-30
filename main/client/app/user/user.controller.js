'use strict';

angular.module('takhshilaApp')
.controller('UserCtrl', function ($rootScope, $scope, $state, $stateParams, $timeout, $compile, $http, $mdDialog, uiCalendarConfig, userFactory, userClassFactory, videoFactory, cart) {
  $rootScope.isLoading = true;

  // var weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

  // var availability = {
  //   sunday: [],
  //   monday: [],
  //   tuesday: [],
  //   wednessday: [],
  //   thursday: [],
  //   friday: [],
  //   saturday: []
  // }

  $scope.gerUserVideos = function(){
    videoFactory.getUserVideos($stateParams.ID)
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

  $scope.bookClass = function(){
    if($scope.selectedSessions.length){
      var cartData = {
        teacherID: $stateParams.ID,
        teacherDetails: $scope.user,
        currency: $scope.user.ratePerHour.currency,
        classData: $scope.selectedSessions
      }
      cart.addToCart(cartData);
      $state.go('checkout');
      // for(var i = 0; i < $scope.selectedSessions.length; i++){
      //   $scope.selectedSessions[i].start = moment($scope.selectedSessions[i].start, 'MMM DD, YYYY HH:mm').format();
      //   $scope.selectedSessions[i].end = moment($scope.selectedSessions[i].end, 'MMM DD, YYYY HH:mm').format();
      // }
      // var _classData = {
      //   teacherID: $stateParams.ID,
      //   classData: $scope.selectedSessions
      // }
      // console.log(_classData);
      // userClassFactory.requestClass('', _classData)
      // .success(function(response){
      //   console.log(response);
      //   $('#availabilityCalendar').fullCalendar('refetchEvents')
      // })
      // .error(function(err){
      //   console.log(err);
      // });
    }
  }

  $scope.getEvents = function(start, end, timezone, callback){
    userFactory.getAvailability($stateParams.ID, {start: start, end: end})
    .success(function(response){
      $scope.events.length = 0;
      for(var i = 0; i < response.length; i++){
        $scope.events.push({
          _id: i+1,
          start: moment(response[i].start, 'MMM DD, YYYY HH:mm'),
          end: moment(response[i].end, 'MMM DD, YYYY HH:mm'),
          className: response[i].status,
          status: response[i].status
        });
      }
      console.log($scope.events);
      callback($scope.events);
    })
    .error(function(err){
      console.log(err);
    });
  };

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

  $scope.events = [];
  $scope.selectedSessions = [];

  var calculateTotal = function(){
    var _totalCost = 0;
    for(var i = 0; i < $scope.selectedSessions.length; i++){
      _totalCost += $scope.selectedSessions[i].cost;
    }
    $scope.totalCost = parseFloat(_totalCost).toFixed(2);
  }

  var eventRender = function( event, element, view ) {
    if(event.status == "available"){
      // element.attr({'uib-popover': '"I have a title!"', 'popover-title': '"The title."', 'popover-trigger': "'mouseenter'"});
      // console.log(event.start);
      element.find('.fc-time').html(moment(event.start, 'MMM DD, YYYY HH:mm').format('HH:mm a'));
    }else {
      element.find('.fc-time').html('');
    }
    $compile(element)($scope);
  };

  // var alertEventOnClick = function(event, element, view){
  //   var _clickedStartDateTime = new Date(event.start).getTime();
  //   var _clickedEndDateTime = new Date(event.end).getTime();
  //
  //   var _processInsert = true;
  //
  //   for(var i = 0; i < $scope.selectedSessions.length; i++){
  //     var _sessionStartDateTime = new Date($scope.selectedSessions[i].startDateTime).getTime();
  //     var _sessionEndDateTime = new Date($scope.selectedSessions[i].endDateTime).getTime();
  //     if(_clickedStartDateTime >= _sessionStartDateTime && _clickedEndDateTime <= _sessionEndDateTime){
  //       $scope.selectedSessions.splice(i, 1);
  //       _processInsert = false;
  //       $('.fc-time-grid-event').removeClass('active');
  //       break;
  //     }else if(_clickedStartDateTime == _sessionEndDateTime){
  //       $scope.selectedSessions[i].elements.push(element.currentTarget);
  //       $scope.selectedSessions[i].endDateTime = event.end;
  //       $scope.selectedSessions[i].endTimeFormated = event.end.format('hh:mm a');
  //       $scope.selectedSessions[i].cost += parseFloat(($scope.user.ratePerHour.value)/2);
  //       _processInsert = false;
  //       break;
  //     }else if(_clickedEndDateTime == _sessionStartDateTime){
  //       $scope.selectedSessions[i].elements.push(element.currentTarget);
  //       $scope.selectedSessions[i].startDateTime = event.start;
  //       $scope.selectedSessions[i].startTimeFormated = event.start.format('hh:mm a');
  //       $scope.selectedSessions[i].cost += parseFloat(($scope.user.ratePerHour.value)/2);
  //       _processInsert = false;
  //       break;
  //     }
  //   }
  //   if(_processInsert){
  //     $scope.selectedSessions.push({
  //       startDateTime: event.start,
  //       endDateTime: event.end,
  //       dateFormated: event.start.format('dddd, MMMM Do YYYY'),
  //       startTimeFormated: event.start.format('hh:mm a'),
  //       endTimeFormated: event.end.format('hh:mm a'),
  //       elements: [element.currentTarget],
  //       cost: parseFloat(($scope.user.ratePerHour.value)/2),
  //       currency: $scope.user.ratePerHour.currency
  //     });
  //   }
  //
  //
  //   $scope.selectedSessions.sort(function(a, b){
  //     return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  //   });
  //
  //   for(var i = $scope.selectedSessions.length - 1; i >= 0; i--){
  //     for(var j = 0; j < $scope.selectedSessions[i].elements.length; j++){
  //       angular.element($scope.selectedSessions[i].elements[j]).addClass("active");
  //     }
  //     if($scope.selectedSessions[i-1] !== undefined){
  //       if(new Date($scope.selectedSessions[i].startDateTime).getTime() == new Date($scope.selectedSessions[i-1].endDateTime).getTime()){
  //         $scope.selectedSessions[i-1].endDateTime = $scope.selectedSessions[i].endDateTime;
  //         $scope.selectedSessions[i-1].endTimeFormated = $scope.selectedSessions[i].endTimeFormated;
  //         $scope.selectedSessions[i-1].cost += $scope.selectedSessions[i].cost;
  //         $scope.selectedSessions.splice(i, 1);
  //       }
  //     }
  //   }
  //   calculateTotal();
  //   $scope.$apply();
  // }

  // var renderView = function(view){
  //   disconnectTime();
  //   var _count = 0;
  //   $scope.events.length = 0;
  //   if(view === undefined){
  //     view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
  //   }
  //   var date = new Date(view.start._d);
  //   var d = date.getDate();
  //   var m = date.getMonth();
  //   var y = date.getFullYear();
  //   for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
  //     _count++;
  //     for(var i = 0; i < availability[weekDays[dayIndex]].length; i++){
  //       _count++
  //       $scope.events.push({
  //         title: 'Book Class Now',
  //         start: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute),
  //         end: new Date(y, m, d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute),
  //         allDay: false,
  //         dayIndex: dayIndex,
  //         availabilityIndex: i,
  //         color: '#CFF1C2'
  //       });
  //     }
  //   }
  //
  //   console.log("Count is " + _count);
  //   // for(var n = 0; n < $scope.events.length; n++){
  //   //   console.log($scope.events[n].start.getTime());
  //   // }
  //   if(uiCalendarConfig.calendars["availabilityCalendar"]){
  //     uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('refetchEvents');
  //   }
  // }

  // var disconnectTime = function(){
  //   for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
  //     availability[weekDays[dayIndex]].sort(function(a, b){
  //       return a.startHour - b.startHour;
  //     });
  //   }
  //   var _availability = {};
  //   var _view = uiCalendarConfig.calendars["availabilityCalendar"].fullCalendar('getView');
  //   var _date = new Date(_view.start._d);
  //   var _d = _date.getDate();
  //   var _m = _date.getMonth();
  //   var _y = _date.getFullYear();
  //   for(var dayIndex = 0; dayIndex < weekDays.length; dayIndex++){
  //     _availability[weekDays[dayIndex]] = [];
  //     for(var i = 0; i < availability[weekDays[dayIndex]].length ; i++){
  //       var _startTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].startHour, availability[weekDays[dayIndex]][i].startMinute).getTime();
  //       var _endTime = new Date(_y, _m, _d+dayIndex, availability[weekDays[dayIndex]][i].endHour, availability[weekDays[dayIndex]][i].endMinute).getTime();
  //       var _difference = Math.round((_endTime - _startTime) / 60000);
  //       if(_difference > 30){
  //         do {
  //           _availability[weekDays[dayIndex]].push({
  //             startHour: new Date(_startTime).getHours(),
  //             startMinute: new Date(_startTime).getMinutes(),
  //             endHour: new Date(_startTime + (30*60000)).getHours(),
  //             endMinute: new Date(_startTime + (30*60000)).getMinutes()
  //           });
  //           _startTime = _startTime + (30*60000);
  //           _difference = Math.round((_endTime - _startTime) / 60000);
  //         } while (_difference > 30);
  //       }else{
  //         _availability[weekDays[dayIndex]].push(availability[weekDays[dayIndex]][i]);
  //       }
  //     }
  //   }
  //   for(var day in _availability){
  //     availability[day] = _availability[day];
  //   }
  // }

  var alertEventOnClick = function(event, element, view){
    var _index = $scope.events.map(function(obj) { return obj._id; }).indexOf(event._id);

    var _clickedStart = moment(event.start, 'MMM DD, YYYY HH:mm');
    var _clickedEnd = moment(event.end, 'MMM DD, YYYY HH:mm');

    // var _allowedToBook = false;
    // if($scope.selectedSessions.length >= 2){
    //   for(var i = 0; i < $scope.selectedSessions.length; i++){
    //     if($scope.selectedSessions[i].start.valueOf() == _clickedEnd.valueOf()
    //         || $scope.selectedSessions[i].end.valueOf() == _clickedStart.valueOf()){
    //           _allowedToBook = true;
    //         }
    //   }
    // }else {
    //   _allowedToBook = true;
    // }
    if($scope.events[_index].status == "booked" || $scope.events[_index].status == "requested" || $scope.events[_index].status == "confirmed" || $scope.events[_index].status == "pendingPayment"){
      return false;
    }else if($scope.events[_index].status == "available"){
      $scope.events[_index].status = "selected";
    }else {
      $scope.events[_index].status = "available";
    }

    if($(this).hasClass('active')){
      $(this).removeClass('active');
      $(this).addClass('available');
    }else{
      $(this).addClass('active');
      $(this).removeClass('available');
    }

    updateEventStatus();
  }

  var updateEventStatus = function(){
    $scope.events.sort(function(a, b){
      return a.start.valueOf() - b.start.valueOf();
    })
    $scope.selectedSessions.length = 0;
    for(var i = $scope.events.length-1; i >= 0 ; i--){
      if($scope.events[i].status == "selected"){
        var _processInsert = true;
        if($scope.selectedSessions.length){
          if($scope.selectedSessions[$scope.selectedSessions.length-1].start.valueOf() == $scope.events[i].end.valueOf()){
            $scope.selectedSessions[$scope.selectedSessions.length-1].start = moment($scope.events[i].start, 'MMM DD, YYYY HH:mm');
            $scope.selectedSessions[$scope.selectedSessions.length-1].startTimeFormated = moment($scope.events[i].start, 'MMM DD, YYYY HH:mm').format('hh:mm a');
            $scope.selectedSessions[$scope.selectedSessions.length-1].cost += parseFloat(($scope.user.ratePerHour.value)/2);
            _processInsert = false;
          }
        }

        if(_processInsert){
          $scope.selectedSessions.push({
            start: moment($scope.events[i].start, 'MMM DD, YYYY HH:mm'),
            end: moment($scope.events[i].end, 'MMM DD, YYYY HH:mm'),
            dateFormated: moment($scope.events[i].start, 'MMM DD, YYYY HH:mm').format('dddd, MMMM Do YYYY'),
            startTimeFormated: moment($scope.events[i].start, 'MMM DD, YYYY HH:mm').format('hh:mm a'),
            endTimeFormated: moment($scope.events[i].end, 'MMM DD, YYYY HH:mm').format('hh:mm a'),
            cost: parseFloat(($scope.user.ratePerHour.value)/2),
            currency: $scope.user.ratePerHour.currency
          });
        }
      }
    }
    $scope.$apply();
  }

  $scope.getReviews = function() {
    $http.get('/api/v1/reviews/' + $stateParams.ID)
    .then(function(response){
      $scope.reviews = response.data;
      var totalRating = 0;
      for(var j = 0; j < $scope.reviews.length; j++){
        totalRating += $scope.reviews[j].rating;
      }
      $scope.averageRating = (totalRating/$scope.reviews.length);
    });
  };

  userFactory.getUserDetails($stateParams.ID)
  .success(function(response){
    $rootScope.isLoading = false;
    $scope.user = response;
    $scope.gerUserVideos();
    if($scope.user.isTeacher){
      $scope.getReviews();
    }
    $(function () {
      setTimeout(function(){
        $('#availabilityCalendar').fullCalendar({
          height: 1024,
          editable: false,
          allDaySlot: false,
          scrollTime :  "5:00",
          header:{
            left: 'prev',
            center: 'title',
            right: 'next'
            // right: ''
          },
          titleFormat: 'MMMM D, YYYY ',
          defaultView: 'agendaWeek',
          eventClick: alertEventOnClick,
          eventRender: eventRender,
          events: $scope.getEvents
        });
      }, 0);
    });
  })
  .error(function(err){
    $rootScope.isLoading = false;
    console.log(err);
  });
});
