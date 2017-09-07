'use strict';

angular.module('takhshilaApp')
  .service('cart', function () {
  	var cart = {};

  	var cartService = {
  		addToCart: function(cartData){
        cart.teacherID = cartData.teacherID;
  			cart.teacherDetails = cartData.teacherDetails;
  			cart.currency = cartData.currency;
  			cart.classData = [];
  			for(var i = 0; i < cartData.classData.length; i++){
  				cart.classData.push(cartData.classData[i]);
  			}
  		},
  		clearCart: function(){
  			cart.length = 0;
  		},
  		getCart: function(){
  			return cart;
  		}
  	}
  	return cartService;
  });
