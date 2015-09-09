var controller;
var menuItemsAvaiList;
var menuItemHeaderControl;
var commentsList;
var menuItemsTbl;
var avgRatingControl;
var userRatingControl;
var selectedModel;
var analysisColumn;
var requestData = {};
var foodCourtImage;

sap.ui.jsview("xtracktrs.Food", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf xtracktrs.Food
	 */
	getControllerName: function() {
		return "xtracktrs.Food";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * @memberOf xtracktrs.Food
	 */
	createContent: function(oController) {
		controller = oController;

		var logonUser = controller.getLogonUsername();
		var userActionSheet = this.createAppActionSheet();
		var ushell = new sap.ui.unified.Shell({
			user: new sap.ui.unified.ShellHeadUserItem({
				username : logonUser,
				image : "sap-icon://person-placeholder",
				press:function(oEvent){
					var oUserItem = oEvent.getSource();
					// Open the action sheet
					if (!userActionSheet.isOpen()) {
						userActionSheet.openBy(oUserItem);
					} else {
						userActionSheet.close();
					}

				}
			}),
			icon: jQuery.sap.getModulePath("sap.ui.core", '/') + "mimes/logo/sap_50x26.png"              
		});

		var tracktersApp = new sap.m.App("tracketersApp",{});

		var tracktersTileContainer;
		if(logonUser==="VENDOR"){
			tracktersTileContainer = new sap.m.TileContainer({
				tiles : [
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://meal",
				        	 number : controller.getFoodCourts().length,
				        	 title : "Food Courts",
				        	 press:function(){
				        		 tracktersApp.to("foodCourtPage");
				        	 }

				         })
				         ]
			});
		}else if(logonUser === "FOODCOURTADMIN"){
			tracktersTileContainer = new sap.m.TileContainer({
				tiles : [
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://inbox",
				        	 number : controller.getRequests().length,
				        	 title : "My Inbox",
				        	 press:function(){
				        		 tracktersApp.to("requestsPage");
				        	 }

				         })
				         ]
			});
		}else{
			tracktersTileContainer = new sap.m.TileContainer({
				tiles : [
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://request",
				        	 number : controller.getRequests().length,
				        	 title : "My Requests",
				        	 press:function(){
				        		 tracktersApp.to("requestsPage");

				        	 }

				         }),
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://meal",
				        	 number : controller.getFoodCourts().length,
				        	 title : "Food Courts",
				        	 press:function(){
				        		 tracktersApp.to("foodCourtPage");
				        	 }

				         }),
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://bed",
				        	 number : "10",
				        	 title : "Bunker Rooms",
				        	 press:function(){
				        		 alert("Coming Soon !!");
				        		 //tracktersApp.to("foodCourtPage");
				        	 }

				         }),
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://theater",
				        	 number : "30",
				        	 title : "Gym",
				        	 press:function(){
				        		 alert("Coming Soon !!");
				        		 //tracktersApp.to("foodCourtPage");
				        	 }

				         }),
				         new sap.m.StandardTile({
				        	 icon : "sap-icon://bed",
				        	 number : "7",
				        	 title : "Medi-Assist",
				        	 press:function(){
				        		 alert("Coming Soon !!");
				        		 //tracktersApp.to("foodCourtPage");
				        	 }

				         })
				         ]
			});
		}

		tracktersApp.addPage(tracktersTileContainer);

		var oSplitApp = this.createFoodCourtPage();
		var masterDetailPage_withNav = new sap.m.Page("foodCourtPage",{
			showNavButton:true,
			navButtonTap:function(){
				tracktersApp.back();
			},
			content: [oSplitApp]
		});
		tracktersApp.addPage(masterDetailPage_withNav);

		var oSplitApp2 = this.createMyRequestPage();
		var masterDetailPage_forRequests = new sap.m.Page("requestsPage",{
			showNavButton:true,
			navButtonTap:function(){
				tracktersApp.back();
			},
			content: [oSplitApp2]
		});
		tracktersApp.addPage(masterDetailPage_forRequests);

		return ushell.addContent(tracktersApp) ;
	},

	createAppActionSheet : function(){
		var userActionSheet = new sap.m.ActionSheet({
			placement : sap.m.PlacementType.Bottom
		});

		var logoutBtn = new sap.m.Button({
			icon:"sap-icon://log",
			text : "Logout",
			press:function(){
				controller.logout();
				window.location.reload();
			}
		}); 
		userActionSheet.addButton(logoutBtn);  
		return userActionSheet;
	},

	createMyRequestPage : function(){
		var oSplitApp = new sap.m.SplitApp({
			id: "MyRequestApp",
			mode : sap.m.SplitAppMode.HideMode
		});

		var myRequests = controller.getRequests();

		var myRequestsModel = new sap.ui.model.json.JSONModel();
		myRequestsModel.setData({
			modelData: myRequests
		});
		controller.getView().setModel(myRequestsModel);

		var oMasterPage = new sap.m.Page({
		});

		var oDetailPage;
		if(controller.getCurrentUserName() !== "FOODCOURTADMIN"){
			oDetailPage = new sap.m.Page("requestDetailPage", {
				title: "My Inbox",
				content: [this.createMyRequestsTableView(myRequestsModel)]
			});
		}else{
			oDetailPage = new sap.m.Page("requestDetailPage", {
				title: "My Requests",
				content: [this.createMyInboxTableView(myRequestsModel)]
			});
		}

		oSplitApp.addMasterPage(oMasterPage);
		oSplitApp.addDetailPage(oDetailPage);
		return oSplitApp;

	},

	createMyRequestsTableView : function(oModel){

		var booking_statusObject = new sap.m.ObjectStatus({});
		booking_statusObject.bindProperty("text", "STATUS", function(status) {
			if (status === 'Y') {
				return "Approved";
			} else {
				return "Not yet approved";
			}
		});

		var foodCourtText = new sap.m.Text({});
		foodCourtText.bindProperty("text", "FOOD_COURT_ID", function(foodCourtId) {
			return controller.getFoodCourtName(foodCourtId);
		});

		var bookingTimeText = new sap.m.Text({});
		bookingTimeText.bindProperty("text", "BOOKING_TIME", function(date) {
			var dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({style:"medium"});
			date = date.replace("/Date(","");
			date = date.replace(")/", "");
			date = parseInt(date);
			return dateFormatter.format(new Date(date));
		});
		var rowTemplate = new sap.m.ColumnListItem({
			cells: [
			        new sap.m.Text({
			        	text: "{BOOKING_ID}"
			        }),
			        foodCourtText,
			        bookingTimeText,
			        new sap.m.Text({
			        	text: "{DURATION}"
			        }),
			        new sap.m.Text({
			        	text: "{SEATS}"
			        }),
			        booking_statusObject
			        ]
		});

		var myRequestTables = new sap.m.Table("myRequestTable", {
			mode: sap.m.ListMode.SingleSelectMaster,
			columns: [
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Booking ID",
			        		  width: "10em",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Name",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Date",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Duration (in min.)",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Seats",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Status",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          })
			          ],
			          items: {
			        	  path: "/modelData",
			        	  template: rowTemplate
			          }
		});

		myRequestTables.setModel(oModel);
		var menuItemsLayoutForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.GridLayout(),
			width: "100%",
			editable: false
		});

		var menuItemsElement = new sap.ui.layout.form.FormElement({
			fields: [myRequestTables]
		});

		var menuItemsContainer = new sap.ui.layout.form.FormContainer({});
		menuItemsContainer.addFormElement(menuItemsElement);

		menuItemsLayoutForm.addFormContainer(menuItemsContainer);
		return menuItemsLayoutForm;

	},

	createMyInboxTableView : function(oModel){

		var approveButton = new sap.ui.commons.Button({
			text : "Approve"
		});

		var rejectButton = new sap.ui.commons.Button({
			text : "Reject"
		});

		var foodCourtText = new sap.m.Text({});
		foodCourtText.bindProperty("text", "FOOD_COURT_ID", function(foodCourtId) {
			return controller.getFoodCourtName(foodCourtId);
		});

		var bookingTimeText = new sap.m.Text({});
		bookingTimeText.bindProperty("text", "BOOKING_TIME", function(date) {
			var dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({style:"medium"});
			date = date.replace("/Date(","");
			date = date.replace(")/", "");
			date = parseInt(date);
			return dateFormatter.format(new Date(date));
		});
		var rowTemplate = new sap.m.ColumnListItem({
			cells: [
			        new sap.m.Text({
			        	text: "{BOOKING_ID}"
			        }),
			        foodCourtText,
			        bookingTimeText,
			        new sap.m.Text({
			        	text: "{DURATION}"
			        }),
			        new sap.m.Text({
			        	text: "{SEATS}"
			        }),
			        approveButton,
			        rejectButton
			        ]
		});

		var myRequestTables = new sap.m.Table("myRequestTable", {
			mode: sap.m.ListMode.SingleSelectMaster,
			columns: [
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Booking ID",
			        		  width: "10em",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Name",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Date",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Duration (in min.)",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Seats",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          })
			          ],
			          items: {
			        	  path: "/modelData",
			        	  template: rowTemplate
			          }
		});

		myRequestTables.setModel(oModel);

		var menuItemsLayoutForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.GridLayout(),
			width: "100%",
			editable: false
		});

		var menuItemsElement = new sap.ui.layout.form.FormElement({
			fields: [myRequestTables]
		});

		var menuItemsContainer = new sap.ui.layout.form.FormContainer({});
		menuItemsContainer.addFormElement(menuItemsElement);

		menuItemsLayoutForm.addFormContainer(menuItemsContainer);
		return menuItemsLayoutForm;

	},

	createFoodCourtPage : function(){

		var oSplitApp = new sap.m.SplitApp({id: "MenuItemDetApp"});

		var allMenuItems = controller.getFoodCourts();

		var ratingAttr = new sap.m.ObjectStatus();
		ratingAttr.bindProperty("state", "SEATS_AVAILABLE", function(seats){
			if(seats <= 20){
				return sap.ui.core.ValueState.Error;
			}else if(seats > 20 && seats <= 50){
				return sap.ui.core.ValueState.Warning;
			}else{
				return sap.ui.core.ValueState.Success;
			}
		});
		ratingAttr.bindProperty("icon", "SEATS_AVAILABLE", function(seats){
			if(seats > 10 && seats < 50){
				return "/xTracktrs/WebContent/icons/yellow.png";
				/*return sap.ui.core.IconPool.getIconURI({
            		src: "sap-icon://activity-items",
            		color: "#2DFA06",  //green
            		});*/
			}else if(seats <= 10){
				return "/xTracktrs/WebContent/icons/red.png";
				/*return sap.ui.core.IconPool.getIconURI({
            		src: "sap-icon://activity-items",
            		color: "#2DFA06",  //green
            		});*/
			}else{
				return "/xTracktrs/WebContent/icons/green.png";
				/*return sap.ui.core.IconPool.getIconURI({
            		src: "sap-icon://activity-items",
            		color: "#2DFA06",  //green
            		});*/
			}
			//return "sap-icon://status-error";
		});

		var availSeatsAttr = new sap.m.ObjectAttribute();
		availSeatsAttr.bindProperty("text", "SEATS_AVAILABLE", function(seats) {
			return seats + " Seats available";
		});

		var totalSeatsAttr = new sap.m.ObjectAttribute();
		totalSeatsAttr.bindProperty("text", "CAPACITY", function(seats) {
			return seats + " Total Seats";
		});

		var menuItemTemplate = new sap.m.ObjectListItem({
			number: "{NAME}",
			numberUnit: "{LOCATION}",
			showMarkers: true,
			attributes: [availSeatsAttr,totalSeatsAttr],
			firstStatus: ratingAttr
		});

		var menuItemsList = new sap.m.List({
			growing: true,
			growingThreshold: 5,
			visible: true,
			mode: sap.m.ListMode.SingleSelectMaster,
			growingScrollToLoad: false,
			selectionChange: function(oEvent) {
				var oListModel = oEvent.getParameter("listItem").getBindingContext();
				var oModels = oListModel.oModel.oData.modelData;
				var path = oListModel.sPath;
				var pathFrags = path.split("/");
				if (pathFrags.length === 3) {
					var index = pathFrags[2];
					selectedModel = oModels[index];
					sap.ui.getCore().byId("detailPage").setBindingContext(selectedModel);
					//sap.ui.getCore().byId("detailPage").bindElement(oListModel);
					var midModel = controller.getAllMenuItems(selectedModel.ID);
					var oItemModel = new sap.ui.model.json.JSONModel();
					oItemModel.setData({
						modelData: midModel
					});
					menuItemsTbl.setModel(oItemModel);

					var historyList = controller.getFoodCourtHistory(selectedModel.ID);
					var historyModel = new sap.ui.model.json.JSONModel();
					historyModel.setData({modelData: historyList});
					analysisColumn.setModel(historyModel);

				}
			}
		});

		var oModel2 = new sap.ui.model.json.JSONModel();
		oModel2.setData({
			modelData: allMenuItems
		});
		controller.getView().setModel(oModel2);
		menuItemsList.setModel(oModel2);
		menuItemsList.bindItems({
			path: "/modelData",
			template: menuItemTemplate
		});

		var searchField = new sap.m.SearchField({
			width: "100%",
			editable: true,
			enableClear: true,
			showRefreshButton: true,
			search: function(oEvent) {
				var searchString = oEvent.getParameters("query").query;

				// add filter for search
				var filters = [];
				if (searchString && searchString.length > 0) {
					filters.push(new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.Contains, searchString));
				}

				// update list binding
				var binding = menuItemsList.getBinding("items");
				binding.filter(filters);

			}
		});

		var oMasterPage = new sap.m.Page({
			id: "masterPage_ACR",
			title: "Food Courts",
			content: [searchField, menuItemsList],
			footer: new sap.m.Bar({
				design: sap.m.BarDesign.Footer
			})
		});

		var oDetailPage = new sap.m.Page("detailPage", {
			title: "Food Court Details",
			content: [this.createFoodItemDetailsPage()]
		//footer : createButtonBar()
		});

		oSplitApp.addMasterPage(oMasterPage);
		oSplitApp.addDetailPage(oDetailPage);
		return oSplitApp;
	},

	openCommentsForm: function(oModel) {
		var oFeedModel = new sap.ui.model.json.JSONModel();
		var oFeedModel_1 = controller.getFeedback(oModel.NAME);
		oFeedModel.setData({
			modelData: oFeedModel_1
		});

		var dialogHeader = new sap.m.ObjectHeader({
			title: oModel.NAME,
			attributes: [new sap.m.ObjectAttribute({
				text: oModel.TYPE
			}),
			new sap.m.ObjectAttribute({
				text: oModel.DESCRIPTION
			}),
			new sap.m.ObjectAttribute({
				text: oModel.CALORIE + " kcal"
			})
			]
		});

		avgRatingControl = new sap.m.RatingIndicator({
			maxValue: 5,
			value: controller.getAverageRating(oModel.NAME)
		});

		userRatingControl = new sap.m.RatingIndicator({
			maxValue: 5,
			value: controller.getUserRating(oModel.NAME)
		});

		var foodItemFeedInput = new sap.m.FeedInput({
			icon: "sap-icon://feed",
			post: function(oEvent) {
				var oDate = new Date();

				// create new entry
				var sValue = oEvent.getParameter("value");
				var oFeedEntry = {
						MENU_ITEM_ID : oModel.NAME,
						USER: controller.getCurrentUserName(),//"Sara O'Connors",
						RATING: oModel.Rating,
						DATE: "" + oDate,
						COMMENT: sValue
				};

				// update model
				//var oModel = this.getView().getModel();
				var aEntries = oFeedModel.oData.modelData;
				aEntries.unshift(oFeedEntry);
				//commentsList.setModel(aEntries);
				oFeedModel.setData({
					modelData: aEntries
				});
			}
		});

		var commentTemplate = new sap.m.FeedListItem({
			sender: "{USER}",
			icon: "sap-icon://customer",
			//senderPress : "onSenderPress",
			//iconPress :"onIconPress"
			iconDensityAware: false,
			timestamp: "{DATE}",
			text: "{COMMENT}"
		});

		commentsList = new sap.m.List({
			growing: true,
			growingThreshold: 5,
			visible: true,
			mode: sap.m.ListMode.SingleSelectMaster,
			growingScrollToLoad: false,
			selectionChange: function(oEvent) {
				// open dialog for food court
			}
		});

		commentsList.bindItems({
			path: "/modelData",
			template: commentTemplate
		});
		commentsList.setModel(oFeedModel);

		var itemAvailLayoutForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.GridLayout(),
			width: "100%",
			editable: false
		});

		var feedbackFormContainer = new sap.ui.layout.form.FormContainer({});
		var headerFormElement = new sap.ui.layout.form.FormElement({
			fields: [dialogHeader]
		});
		var allCommentsFormElement = new sap.ui.layout.form.FormElement({
			fields: [commentsList]
		});

		var hLayout_userRating = new sap.ui.commons.layout.HorizontalLayout({
			width: "100%"
		});
		hLayout_userRating.addContent(new sap.m.Label({
			text: "Your Rating"
		}));
		hLayout_userRating.addContent(userRatingControl);

		var hLayout_avgRating = new sap.ui.commons.layout.HorizontalLayout({
			width: "100%"
		});
		hLayout_avgRating.addContent(new sap.m.Label({
			text: "Average Rating"
		}));
		hLayout_avgRating.addContent(avgRatingControl);

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});
		vLayout.addContent(avgRatingControl);

		var vLayout_1 = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});
		vLayout_1.addContent(userRatingControl);

		var myRatingFormElement = new sap.ui.layout.form.FormElement({
			fields: [new sap.m.Label({
				text: "Your Rating"
			}), vLayout_1,
			new sap.m.Label({
				text: "Average Rating"
			}), vLayout
			]
		});
		var feedInputFormElement = new sap.ui.layout.form.FormElement({
			fields: [foodItemFeedInput]
		});
		feedbackFormContainer.addFormElement(headerFormElement);
		feedbackFormContainer.addFormElement(myRatingFormElement);
		feedbackFormContainer.addFormElement(feedInputFormElement);
		feedbackFormContainer.addFormElement(allCommentsFormElement);
		itemAvailLayoutForm.addFormContainer(feedbackFormContainer);

		var dialog = new sap.m.Dialog({
			title: 'Feedback on MenuItem',
			contentHeight: '650px',
			contentWidth: '1000px',
			content: [itemAvailLayoutForm],
			buttons: [new sap.m.Button({
				text: "Ok",
				press: function(oEvent) {
					if (dialog.isOpen()) {
						//Need to push the comment to data base
						dialog.close();
					}
				}
			})]
		});


		dialog.open();

	},

	openApprovalForm: function(oModel) {
		var oFeedModel = new sap.ui.model.json.JSONModel();
		var oFeedModel_1 = controller.getFeedback(oModel.NAME);
		oFeedModel.setData({
			modelData: oFeedModel_1
		});

		var dialogHeader = new sap.m.ObjectHeader({
			title: oModel.NAME,
			attributes: [new sap.m.ObjectAttribute({
				text: oModel.TYPE
			}),
			new sap.m.ObjectAttribute({
				text: oModel.DESCRIPTION
			}),
			new sap.m.ObjectAttribute({
				text: oModel.CALORIE + " kcal"
			})
			]
		});

		avgRatingControl = new sap.m.RatingIndicator({
			maxValue: 5,
			value: controller.getAverageRating(oModel.NAME)
		});

		userRatingControl = new sap.m.RatingIndicator({
			maxValue: 5,
			value: controller.getUserRating(oModel.NAME)
		});

		var foodItemFeedInput = new sap.m.FeedInput({
			icon: "sap-icon://feed",
			post: function(oEvent) {
				var oDate = new Date();

				// create new entry
				var sValue = oEvent.getParameter("value");
				var oFeedEntry = {
						MENU_ITEM_ID : oModel.NAME,
						USER: controller.getCurrentUserName(),//"Sara O'Connors",
						RATING: oModel.Rating,
						DATE: "" + oDate,
						COMMENT: sValue
				};

				// update model
				//var oModel = this.getView().getModel();
				var aEntries = oFeedModel.oData.modelData;
				aEntries.unshift(oFeedEntry);
				//commentsList.setModel(aEntries);
				oFeedModel.setData({
					modelData: aEntries
				});
			}
		});

		var commentTemplate = new sap.m.FeedListItem({
			sender: "{USER}",
			icon: "sap-icon://customer",
			//senderPress : "onSenderPress",
			//iconPress :"onIconPress"
			iconDensityAware: false,
			timestamp: "{DATE}",
			text: "{COMMENT}"
		});

		commentsList = new sap.m.List({
			growing: true,
			growingThreshold: 5,
			visible: true,
			mode: sap.m.ListMode.SingleSelectMaster,
			growingScrollToLoad: false,
			selectionChange: function(oEvent) {
				// open dialog for food court
			}
		});

		commentsList.bindItems({
			path: "/modelData",
			template: commentTemplate
		});
		commentsList.setModel(oFeedModel);

		var itemAvailLayoutForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.GridLayout(),
			width: "100%",
			editable: false
		});

		var feedbackFormContainer = new sap.ui.layout.form.FormContainer({});
		var headerFormElement = new sap.ui.layout.form.FormElement({
			fields: [dialogHeader]
		});
		var allCommentsFormElement = new sap.ui.layout.form.FormElement({
			fields: [commentsList]
		});

		var hLayout_userRating = new sap.ui.commons.layout.HorizontalLayout({
			width: "100%"
		});
		hLayout_userRating.addContent(new sap.m.Label({
			text: "Your Rating"
		}));
		hLayout_userRating.addContent(userRatingControl);

		var hLayout_avgRating = new sap.ui.commons.layout.HorizontalLayout({
			width: "100%"
		});
		hLayout_avgRating.addContent(new sap.m.Label({
			text: "Average Rating"
		}));
		hLayout_avgRating.addContent(avgRatingControl);

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});
		vLayout.addContent(avgRatingControl);

		var vLayout_1 = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});
		vLayout_1.addContent(userRatingControl);

		var myRatingFormElement = new sap.ui.layout.form.FormElement({
			fields: [new sap.m.Label({
				text: "Your Rating"
			}), vLayout_1,
			new sap.m.Label({
				text: "Average Rating"
			}), vLayout
			]
		});
		var feedInputFormElement = new sap.ui.layout.form.FormElement({
			fields: [foodItemFeedInput]
		});
		feedbackFormContainer.addFormElement(headerFormElement);
		feedbackFormContainer.addFormElement(myRatingFormElement);
		feedbackFormContainer.addFormElement(feedInputFormElement);
		feedbackFormContainer.addFormElement(allCommentsFormElement);
		itemAvailLayoutForm.addFormContainer(feedbackFormContainer);

		var dialog = new sap.m.Dialog({
			title: 'Feedback on MenuItem',
			contentHeight: '650px',
			contentWidth: '1000px',
			content: [itemAvailLayoutForm],
			buttons: [new sap.m.Button({
				text: "Ok",
				press: function(oEvent) {
					if (dialog.isOpen()) {
						//Need to push the comment to data base
						dialog.close();
					}
				}
			})]
		});


		dialog.open();

	},

	createMenuItemDetailsTable: function() {
		var availabilityObject = new sap.m.ObjectStatus({});
		availabilityObject.bindProperty("state", "AVAILABILITY", function(status) {
			if (status === 'Y') {
				return sap.ui.core.ValueState.Success;
			} else {
				return sap.ui.core.ValueState.Warning;
			}
		});
		availabilityObject.bindProperty("icon", "AVAILABILITY", function(status) {
			if (status === 'Y') {
				return "sap-icon://sys-enter-2";
			} else {
				return "sap-icon://sys-cancel";
			}
		});

		var availabilityCheckbox = new sap.m.CheckBox({
			select: function() {
				// do something here 
			}
		});
		availabilityCheckbox.bindProperty("selected", "AVAILABILITY", function(status) {
			return status === 'Y';
		});


		var rowTemplate;

		if(controller.getCurrentUserName() !== "VENDOR"){
			rowTemplate = new sap.m.ColumnListItem({
				cells: [
				        new sap.m.Text({
				        	text: "{TYPE}"
				        }),
				        new sap.m.Text({
				        	text: "{NAME}"
				        }),
				        new sap.m.Text({
				        	text: "{DESCRIPTION}"
				        }),
				        new sap.m.Text({
				        	text: "{CALORIE}"
				        }),
				        availabilityObject
				        ]
			});
		}else{
			rowTemplate = new sap.m.ColumnListItem({
				cells: [
				        new sap.m.Text({
				        	text: "{TYPE}"
				        }),
				        new sap.m.Text({
				        	text: "{NAME}"
				        }),
				        new sap.m.Text({
				        	text: "{DESCRIPTION}"
				        }),
				        new sap.m.Text({
				        	text: "{CALORIE}"
				        }),
				        availabilityCheckbox

				        ]
			});
		}



		menuItemsTbl = new sap.m.Table("menuItemTable", {
			mode: sap.m.ListMode.SingleSelectMaster,
			columns: [
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Type",
			        		  width: "10em",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Name",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Description",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Calorie",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          }),
			          new sap.m.Column({
			        	  header: new sap.m.Text({
			        		  text: "Availability",
			        		  minScreenWidth: "Tablet",
			        		  demandPopin: "true"
			        	  })
			          })
			          ],
			          items: {
			        	  path: "/modelData",
			        	  template: rowTemplate
			          },
			          itemPress: function(oEvent) {
			        	  if(controller.getCurrentUserName() !== "VENDOR"){

			        		  var oListModel = oEvent.getParameter("listItem").getBindingContext();
			        		  var oModels = oListModel.oModel.oData.modelData;
			        		  var path = oListModel.sPath;
			        		  var pathFrags = path.split("/");
			        		  if (pathFrags.length === 3) {
			        			  var index = pathFrags[2];
			        			  var selectedModel = oModels[index];
			        			  controller.getView().openCommentsForm(selectedModel);
			        		  }
			        	  }
			          }
		});

		if(controller.getCurrentUserName() !== "VENDOR"){
			rowTemplate.bindProperty("type", "Availability", function() {
				return sap.m.ListType.Navigation;
			});
		}
		var menuItemsLayoutForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.GridLayout(),
			width: "100%",
			editable: false
		});

		var menuItemsElement = new sap.ui.layout.form.FormElement({
			fields: [menuItemsTbl]
		});

		var menuItemsContainer = new sap.ui.layout.form.FormContainer({});
		menuItemsContainer.addFormElement(menuItemsElement);

		menuItemsLayoutForm.addFormContainer(menuItemsContainer);
		return menuItemsLayoutForm;
	},

	createReservationForm: function() {
		var tableLayoutForm = new sap.ui.layout.form.Form({
			layout : new sap.ui.layout.form.GridLayout(),
			enabled : false,
			singleColumn : false,
			editable : true
		});

		var leftFormContainer = new sap.ui.layout.form.FormContainer({
			title: new sap.ui.core.Title({text: "Food Court Booking"}),
			layoutData :  new sap.ui.layout.form.GridContainerData({halfGrid: false})
		});


		var foodCourtTxt = new sap.m.Select("foodCourtID", {
			items : [new sap.ui.core.Item({key : "F1", text : "Indoor Cafeteria"}),
			         new sap.ui.core.Item({key : "F2", text : "Canopy"}),
			         new sap.ui.core.Item({key : "F3", text : "BLR04 Terrace"}),
			         new sap.ui.core.Item({key : "F4", text : "RMZ Terrace"})],
			         change : function(oEvent){
			        	 if(requestData !== undefined){
			        		 requestData.FOOD_COURT_ID = oEvent.getParameters("selectedItem").selectedItem.getProperty("key");
			        	 }
			         },
			         layoutData : new sap.ui.layout.form.GridElementData({hCells:"4"})
		}).addStyleClass("");	

		var foodCourtElement = new sap.ui.layout.form.FormElement({
			label : new sap.m.Label({text: "Food Court", required : true}),
			fields : [foodCourtTxt]
		});	

		leftFormContainer.addFormElement(foodCourtElement);

		var dateTimeTxt = new sap.m.DateTimeInput({
			type : sap.m.DateTimeInputType.DateTime,
			//displayFormat : "MMM dd, yyyy",
			valueFormat : "yyyy-MM-dd HH:MM:SS",
			placeholder : "Select date of booking",
			change : function(oEvent){
				if(requestData !== undefined){
					requestData.BOOKING_TIME = oEvent.getParameters("value").value;
				}
			},
			layoutData : new sap.ui.layout.form.GridElementData({hCells:"4"})
		});

		var dateElement = new sap.ui.layout.form.FormElement({
			label : new sap.m.Label({text: "Booking Date", required : true}),
			fields : [dateTimeTxt]
		});
		leftFormContainer.addFormElement(dateElement);

		var durationTxt = new sap.m.Input("incidentPlaceStreet", {
			type: sap.m.InputType.Text,
			change : function(oEvent){
				requestData.DURATION = oEvent.getParameters("value").value;
			},
			layoutData : new sap.ui.layout.form.GridElementData({hCells:"2"})
		}).addStyleClass("");

		var durationElement = new sap.ui.layout.form.FormElement({
			label : new sap.m.Label({text: "Duration (in mins)", required : true}),
			fields : [durationTxt]
		});
		leftFormContainer.addFormElement(durationElement);

		var seatsTxt = new sap.m.Input({
			value : 0,
			change : function(oEvent){
				requestData.SEATS = oEvent.getParameters("value").value;
			},
			layoutData : new sap.ui.layout.form.GridElementData({hCells:"2"})
		}).addStyleClass("");

		var seatsElement = new sap.ui.layout.form.FormElement({
			label : new sap.m.Label({text: "Number of Seats", required : true}),
			fields : [seatsTxt]
		});	

		leftFormContainer.addFormElement(seatsElement);

		var bookBtn = new sap.m.Button({
			text : "Book Now",
			type : sap.m.ButtonType.Emphasized,
			press : function(oEvent){
				//sent request

				requestData.BOOKING_ID = controller.generateBookingID();
				requestData.USER = controller.getCurrentUserName();
				requestData.STATUS = 'N';

				controller.postRequests(requestData);
				sap.ui.commons.MessageBox.show("Your booking request has been registered", "Booking Confirmation"); 
			},
			layoutData : new sap.ui.layout.form.GridElementData({hCells:"2"})
		}).addStyleClass("");

		var bookBtnElement = new sap.ui.layout.form.FormElement({
			fields : [bookBtn]
		});	

		leftFormContainer.addFormElement(bookBtnElement);

		tableLayoutForm.addFormContainer(leftFormContainer);
		return tableLayoutForm;

	},

	createAnalysisForm: function() {
		var dim = new sap.viz.ui5.data.DimensionDefinition({axis : 1, name: "Time"});
		dim.bindProperty("value", "MEALTIME", function(time){
			if(time !== null && time !== undefined){
				//PT14H0M0S
				time = time.replace("PT", "");
				time = time.replace("H", ":");
				time = time.replace("M", ":");
				time = time.replace("S", "");
				return time;
			}
		});
		var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			dimensions: [dim/*{axis : 1, name: "Time",value: "{MEALTIME}"}*/],
			measures: [{name: "Number of Seats Occupied", value: "{AVG_SEAT_OCCUPIED}"}],
			data: {path: "/modelData"}
		});

		analysisColumn = new sap.viz.ui5.StackedColumn({
			legend : new sap.viz.ui5.types.legend.Common({visible : false}),
			title : {visible : false, text : "Food Court Performance Metrics"},
			yAxis: new sap.viz.ui5.types.Axis({
				title : [new sap.viz.ui5.types.Axis_title({text : "Number of Seats Occupied", visible : true})]
			}),
			xAxis: new sap.viz.ui5.types.Axis({
				title : [new sap.viz.ui5.types.Axis_title({text : "Time", visible : true})]
			}),
			plotArea : {
				animation : {
					resize : true,
					dataLoading : false,
					dataUpdating : false
				}}
		});

		analysisColumn.setDataset(oDataset);

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});

		vLayout.addContent(analysisColumn);
		return vLayout;

	},

	createLocationForm: function(){

		foodCourtImage = new sap.m.Image({
			width : "100%",
			height : "100%"

		});

		foodCourtImage.bindProperty("src", "ID", function(foodCourtID) {
			if(foodCourtID === 'F1'){
				return "/xTracktrs/WebContent/icons/Indoor.png";
			}else if(foodCourtID === 'F2'){
				return "/xTracktrs/WebContent/icons/canopy.png";
			}else if(foodCourtID === 'F3'){
				return "/xTracktrs/WebContent/icons/Building4.png";
			}else if(foodCourtID === 'F4'){
				return "/xTracktrs/WebContent/icons/RMZ.png";
			}
		});

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});

		vLayout.addContent(foodCourtImage);
		return vLayout;
	},

	createFoodItemDetailsPage: function() {
		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width: "100%"
		});

		var itemAvailForm = this.createMenuItemDetailsTable();
		var analysisForm = this.createAnalysisForm();
		var bookingForm = this.createReservationForm();
		var locationForm = this.createLocationForm();

		var itemFilter1 = new sap.m.IconTabFilter({
			icon: "sap-icon://menu",
			content: [itemAvailForm]
		});
		var itemFilter2 = new sap.m.IconTabFilter({
			icon: "sap-icon://bar-chart",
			content: [analysisForm]
		});
		var itemFilter3 = new sap.m.IconTabFilter({
			icon: "sap-icon://add-coursebook",
			content: [bookingForm]
		});
		var itemFilter4 = new sap.m.IconTabFilter({
			icon: "sap-icon://functional-location",
			content: [locationForm]
		});
		var iconTab = new sap.m.IconTabBar();
		iconTab.addItem(itemFilter1);
		if(controller.getCurrentUserName() !== "VENDOR"){
			iconTab.addItem(itemFilter2);
			iconTab.addItem(itemFilter3);
		}
		iconTab.addItem(itemFilter4);

		var availSeatsStatus = new sap.m.ObjectStatus();
		availSeatsStatus.bindProperty("text", "SEATS_AVAILABLE", function(seats) {
			return seats + " Seats available";
		});

		var totalSeatsStatus = new sap.m.ObjectStatus();
		totalSeatsStatus.bindProperty("text", "CAPACITY", function(seats) {
			return seats + " Total Seats";
		});

		var menuItemHeaderControl = new sap.m.ObjectHeader({
			title: "{NAME}",
			//number: "{LOCATION}",
			//numberUnit : "{Calorie}",
			attributes: [new sap.m.ObjectAttribute({
				text: "{LOCATION}"
			})],
			firstStatus: availSeatsStatus,
			secondStatus: totalSeatsStatus
		});

		menuItemHeaderControl.bindProperty("icon", "SEATS_AVAILABLE", function(primary) {
			return "sap-icon://meal";
		});

		vLayout.addContent(menuItemHeaderControl);
		vLayout.addContent(iconTab);

		return vLayout;
	}
});
