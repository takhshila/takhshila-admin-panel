'use strict';

angular.module('takhshilaApp')
  .factory('api', function ($http) {
    var version = "v1";
    // var base_url = "http://api.eazevent.in/" + "" + version;
    var base_url = "http://localhost:9000/api"+ "/" + version + "/";

    function getRequest(url, id, params) {
        url = url + id + '/';
        return $http.get(base_url+url, params);
    }
    function getListRequest(url, params) {
        return $http.get(base_url+url, params);
    }
    function postRequest(url, data) {
        return $http.post(base_url+url, data);
    }
    function postDataRequest(url, data, config) {
        return $http.post(base_url+url, data, config);
    }
    function putRequest(url, id, data) {
        url = url + id + '/';
        return $http.put(base_url+url, data);
    }
    function putWithDataRequest(url, id, data, params) {
        url = url + id + '/';
        return $http.put(base_url+url, data, params);
    }
    function deleteRequest(url, id, params) {
        url = url + id + '/';
        return $http.delete(base_url+url, params);
    }
    function getBaseUrl() {
        return base_url;
    }

    var api = {};
    api.get = getRequest;
    api.getList = getListRequest;
    api.post = postRequest;
    api.postWithData = postDataRequest;
    api.put = putRequest;
    api.putData = putWithDataRequest;
    api.delete = deleteRequest;
    api.getBaseUrl = getBaseUrl;

    return api;
  });
