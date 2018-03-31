'use strict';

angular.module('takhshilaApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, userFactory, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', user).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      register: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/v1/users/register', user).
        success(function(data) {
          // $cookieStore.put('token', data.token);
          // currentUser = User.get();
          deferred.resolve(data);
          return cb(data);
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Verify One Time Password
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      verifyPhoneNumber: function(data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/v1/users/verifyPhoneNumber', data).
        success(function(data) {
          if(data.token){
            $cookieStore.put('token', data.token);
            currentUser = User.get();
          }
          deferred.resolve(data);
          return cb(data);
        }).
        error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },
      
      /**
       * Verify One Time Password
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      verifyOTP: function(data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/v1/users/verifyOTP', data).
        success(function(data) {
          if(data.token){
            $cookieStore.put('token', data.token);
            currentUser = User.get();
          }
          deferred.resolve(data);
          return cb(data);
        }).
        error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Send One Time Password
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      sendOTP: function(data, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/v1/users/sendOTP', data).
        success(function(data) {
          // if(data.token){
          //   $cookieStore.put('token', data.token);
          //   currentUser = User.get();
          // }
          deferred.resolve(data);
          return cb(data);
        }).
        error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },
      /**
       * Update password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      updatePassword: function(newPassword, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.put('/api/v1/users/updatePassword', {newPassword: newPassword}).
        success(function(data) {
          deferred.resolve(data);
          return cb(data);
        }).
        error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      }
    };
  });
