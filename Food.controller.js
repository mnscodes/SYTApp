sap.ui.controller("xtracktrs.Food", {

	getRequests : function() {
		var currentUser = this.getCurrentUserName();
		var oDataUrl;
		if(currentUser === "FOODCOURTADMIN"){
			oDataUrl = "http://10.53.146.178:8002/xTracktrs/WebContent/services/getallrequestsService.xsodata/RequestDetails?$format=json";
		}else{
			oDataUrl = "http://10.53.146.178:8002/xTracktrs/WebContent/services/getallrequestsService.xsodata/RequestDetails?$format=json&$filter=USER%20%20eq%20%27" + currentUser + "%27";
		}
		var oModel;
		jQuery.ajax({
			url: oDataUrl ,
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	generateBookingID : function() {
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/getallrequestsService.xsodata/RequestDetails?$format=json",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return "B"+ (oModel.length + 1);
	},

	postRequests : function(jsondata) {
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/xsjs/postService.xsjs",
			method: "POST",
			data : jsondata,
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				alert("Booking done !!");
			}
		});
	},

	getFoodCourts : function() {
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/getAllFoodCourts.xsodata/FoodCourtDetails?$format=json",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	getFoodCourtName : function(foodCourtID) {
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/getAllFoodCourts.xsodata/FoodCourtDetails?$format=json&$filter=ID%20%20eq%20%27"+foodCourtID +"%27",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results[0];
				}
			}
		});


		return oModel.NAME;
	},

	getMenuItems : function(){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/getAllMenuItems.xsodata/MenuItemDetails?$format=json",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	getAllMenuItems : function(foodcourtid){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/menuItemDetailsService.xsodata/MenuItemDetails?$format=json&$filter=FOOD_COURT_ID%20%20eq%20%27"+foodcourtid +"%27",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	getMenuItemDetails : function(menuitemname){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/menuItemDetailsService.xsodata/MenuItemDetails?$format=json&$filter=NAME%20%20eq%20%27"+menuitemname +"%27",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	getFeedback : function(menuitemname){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/Feedback.xsodata/MenuItemFeedback?$format=json&$filter=MENUITEM_ID%20%20eq%20%27"+menuitemname +"%27",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},  

	getUserRating : function(menuitemname){
		var currentUser = this.getCurrentUserName();
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/Feedback.xsodata/MenuItemFeedback?$format=json&$filter=MENUITEM_ID%20%20eq%20%27"+menuitemname +"%27%20and%20USER%20%20eq%20%27"+currentUser + "%27",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		//It might be possible if user gives rating more than 1 time //HACK
		var avgRating = 0;
		var totalRatings = oModel.length;
		if(totalRatings>0){
			for(var index=0; index<totalRatings; index++){
				avgRating = avgRating + oModel[index].RATING;
			}

			avgRating = Math.round(avgRating * 100 / totalRatings) / 100;
		}
		return avgRating;
	},   

	getAverageRating : function(menuitemname){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/Feedback.xsodata/MenuItemFeedback?$format=json&$filter=MENUITEM_ID%20%20eq%20%27"+menuitemname +"%27%20",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		var avgRating = 0;
		var totalRatings = oModel.length;
		if(totalRatings>0){
			for(var index=0; index<totalRatings; index++){
				avgRating = avgRating + oModel[index].RATING;
			}

			avgRating = Math.round(avgRating * 100 / totalRatings) / 100;
		}
		return avgRating;
	},

	getFoodCourtHistory : function(foodcourtid){
		var oModel;
		jQuery.ajax({
			url: "http://10.53.146.178:8002/xTracktrs/WebContent/services/foodcourthistoryservice.xsodata/FoodCourtHistoryDetails?$format=json&$filter=FOOD_COURT_ID%20%20eq%20%27"+foodcourtid +"%27&$orderby=MEALTIME",
			method: "GET",
			datatype: "json",
			async : false,
			success: function(result, textStatus, xhr) {
				if(result){
					oModel = result.d.results;
				}
			}
		});

		return oModel;
	},

	getLogonUsername : function(){
		var logonUser;
		jQuery.ajax({
			url : "/sap/hana/xs/formLogin/checkSession.xsjs",
			async : false,
			success : function(result, textStatus, xhr){
				logonUser = result.username;
			}
		});

		return logonUser;
	},

	logout :function(){
		function send(CSRFToken) {
			$.ajax({
				url : "/sap/hana/xs/formLogin/logout.xscfunc",
				type : "POST",
				dataType : "json",
				beforeSend : function(xhr) {
					xhr.setRequestHeader("X-CSRF-Token", CSRFToken);
				}
			});
		}
		(function() {
			$.ajax({
				url : "/sap/hana/xs/formLogin/token.xsjs",
				type : "GET",
				beforeSend : function(xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success : function(data, textStatus, XMLHttpRequest) {
					var CSRFToken = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
					send(CSRFToken);
				}
			});
		}());

	}, 

	getCurrentUserName : function(){
		return this.getLogonUsername();
	}
});
