sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/MessageToast",
	"sap/m/Image",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/CustomListItem",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/table/SelectionMode",
	"sap/ui/table/SelectionBehavior",
	"sap/ui/core/BusyIndicator"
], function(Controller, ODataModel, JSONModel, Popover, Button, Dialog, List, StandardListItem, MessageToast, Image, HorizontalLayout,
	Label, Text, CustomListItem, Fragment, MessageBox, ResourceModel, Filter, FilterOperator, SelectionMode, SelectionBehavior,
	BusyIndicator) {
	"use strict";

	return Controller.extend("Distriplus_mag_ret_prepare.controller.View1", {

		onInit: function() {
			var oView = this.getView();
			var osite = oView.byId("__PLANT");
			//Function module ZFIORI_GET_PLANT_OF_USER
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var Box = response.Box;
				var type = response.Type;
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				var TypeCode = oView.byId("TYPECODE");
				TypeCode.setText(type);
				if (Box === "") {
					var oTile = oView.byId("BUTTONS");
					oTile.setVisible(true);
				}
				if (Box !== "") {
					var oArticle = oView.byId("Article");
					oArticle.setVisible(true);
					oArticle.focus();
					oView.byId("H_BOX").setVisible(true);
					var obox = oView.byId("Z_BOX");
					obox.setVisible(true);
					obox.setEnabled(false);
					obox.setValue(Box);
					oView.byId("SearchArt").focus();
					var oTable = oView.byId("table1");
					oArticle = oView.byId("BUTTONS");
					oArticle.setVisible(false);
					oTable.setVisible(true);
					var Button = oView.byId("TOOL_BAR");
					Button.setVisible(true);
					var Type = oView.byId("TYPE");
					var Icon = oView.byId("__icon2");
					var otype = oView.byId("TYPEFLUX");
					var libelle = "";
					otype.setVisible(true);
					if (type === "01") {
						libelle = "Remodeling";
						Icon.setSrc("activate");
					}
					if (type === "02") {
						libelle = "Defect";
						Icon.setSrc("add-equipment");
					}
					if (type === "03") {
						libelle = "Overstock";
						Icon.setSrc("feed");
					}
					if (type === "04") {
						libelle = "Return to supplier";
						Icon.setSrc("home-share");
					}
					Type.setText(libelle);
					TypeCode.setText(type);
					var searchString = "B/" + Box;
					//Function mdoule Z_GET_BOX_CONTENT
					var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
					var OData = new ODataModel(URL, true);
					var query = "/ItemsSet?$filter=ZembArt" + "%20eq%20" + "%27" + searchString + "%27&$format=json";
					debugger;
					OData.read(query, null, null, true, function(response) {
						var oArticle_input = oView.byId("SearchArt");
						oArticle_input.focus();
						oArticle_input.addEventDelegate({
							"onAfterRendering": function() {
								$("document").ready(function() {
									oArticle_input.focus();
								});
							}
						}, this);
						var newArray = response.results;
						var lines = newArray.length;
						var sum = parseInt(response.results[0].Menge);
						for (var i = 1; i < response.results.length; i++) {
							if (i < response.results.length) {
								sum = parseInt(response.results[i].Menge) + sum;
							}
						}
						var model2 = new JSONModel({
							"Sum": sum,
							"Products": lines
						});
						oView.setModel(model2, "Model2");

						if (lines > 8) {
							oView.byId("Scroll").setVisible(true);
						}
						var model = new JSONModel({
							"items": newArray
						});

						model.setSizeLimit(9999);
						oView.setModel(model, "itemModel");
						// promise.resolve();

					}, function(error) {
						console.log("Error: " + error.response.body.toString());

					});
				}
			}, function(error) {
				debugger;
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//promise.reject();
			});
		},

		CloseBox: function(oEvent) {
			var oView = this.getView();
			var oController = this;
			oView.byId("CLOSE_BOX").setEnabled(false);
			var box = oView.byId("Z_BOX").getValue();
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(ZembArt='C" + box + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "E") {
					var path = $.sap.getModulePath("Distriplus_mag_ret_prepare", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.ERROR);
				}
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "O") {
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.INFORMATION);
					oController.BackInit();
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//		promise.reject();
			});
		},

		ClearBox: function() {
			var oView = this.getView();
			var box = oView.byId("Z_BOX").getValue();
			//Function mdoule Z_GET_BOX_CONTENT
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(ZembArt='T" + box + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.E_MESSAGE !== "" && response.E_ZTYPE === "O") {
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					var oArticle_input = oView.byId("SearchArt");
					oArticle_input.addEventDelegate({
						"onAfterRendering": function() {
							$("document").ready(function() {
								oArticle_input.focus();
							});
						}
					}, this);
					MessageBox.show(response.E_MESSAGE, MessageBox.Icon.INFORMATION);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//	promise.reject();
			});
		},

		InitFlux: function(oEvent) {
			var oView = this.getView();
			var action = oEvent.getParameter("id");
			var Type = oView.byId("TYPE");
			var Icon = oView.byId("__icon2");
			var libelle = null;
			var TypeCode = oView.byId("TYPECODE");
			if (action.indexOf("Remodeling") !== -1) {
				libelle = oView.byId("Remodeling").getTitle();
				Type.setText(libelle);
				Icon.setSrc("activate");
				TypeCode.setText("01");
			} else if (action.indexOf("Defect") !== -1) {
				libelle = oView.byId("Defect").getTitle();
				Type.setText(libelle);
				Icon.setSrc("add-equipment");
				TypeCode.setText("02");
			} else if (action.indexOf("Overstock") !== -1) {
				libelle = oView.byId("Overstock").getTitle();
				Type.setText(libelle);
				Icon.setSrc("feed");
				TypeCode.setText("03");
			} else if (action.indexOf("Rsupplier") !== -1) {
				libelle = oView.byId("Rsupplier").getTitle();
				Type.setText(libelle);
				Icon.setSrc("home-share");
				TypeCode.setText("04");
			}
			var oArticle = oView.byId("H_BOX");
			oArticle.setVisible(true);
			oArticle = oView.byId("TYPEFLUX");
			oArticle.setVisible(true);
			oArticle = oView.byId("BUTTONS");
			oArticle.setVisible(false);
			var oBack = oView.byId("Back");
			oBack.setVisible(true);
			var obox = oView.byId("Z_BOX");
			obox.addEventDelegate({
				"onAfterRendering": function() {
					$("document").ready(function() {
						obox.focus();
					});
				}
			}, this);
		},

		BackInit: function() {
			this.getView().byId("CLOSE_BOX").setEnabled(true);
			var oView = this.getView();
			var oArticle = oView.byId("H_BOX");
			oArticle.setVisible(false);
			oArticle = oView.byId("TYPEFLUX");
			oArticle.setVisible(false);
			oArticle = oView.byId("BUTTONS");
			oArticle.setVisible(true);
			var oBack = oView.byId("Back");
			oBack.setVisible(false);
			oArticle = oView.byId("Article");
			oArticle.setVisible(false);
			var obox = oView.byId("Z_BOX");
			obox.setEnabled(true);
			obox.setValue("");
			var oTable = oView.byId("table1");
			oTable.setVisible(false);
			var Button = oView.byId("TOOL_BAR");
			Button.setVisible(false);
			var model = new JSONModel();
			oView.setModel(model, "itemModel");
		},

		searchItems: function() {
			var oView = this.getView();
			var filters = [];
			var searchString = this.getView().byId("searchItem").getValue();
			if (searchString && searchString.length > 0) {
				filters = [new Filter("Gtin", FilterOperator.Contains, searchString)];
				var oFilter = new Filter(filters, false);
				// Update list binding
				oView.byId("table1").getBinding("rows").filter(oFilter);
			} else {
				oView.byId("table1").getBinding("rows").filter(filters);
			}
		},

		searchArt: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var material = oView.byId("SearchArt").getValue();
			var TypeCode = oView.byId("TYPECODE").getText();
			// Function module Z_CHECK_SCAN_VALUE
			var URL2 = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL2, true);
			var query = "/MessageSet(PValue='02" + TypeCode + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response2) {
				BusyIndicator.hide();
				if (response2.EMessage !== "" && response2.EZtype === "E") {
					var path = $.sap.getModulePath("Distriplus_mag_ret_prepare", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response2.EMessage, MessageBox.Icon.ERROR);
				} else {
					var oTable = oView.byId("table1");
					oTable.setVisible(true);
					oController.GetData();
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//promise.reject();
			});
		},

		CheckBox: function() {
			var oView = this.getView();
			var box = oView.byId("Z_BOX").getValue();
			// Function module Z_CHECK_SCAN_VALUE
			var URL2 = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL2, true);
			var query = "/MessageSet(PValue='01" + box + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response2) {
				BusyIndicator.hide();
				if (response2.EMessage !== "" && response2.EZtype === "E") {
					oView.byId("Z_BOX").setValue('');
					MessageBox.show(response2.EMessage, MessageBox.Icon.ERROR);
				} else {
					var oArticle = oView.byId("Article");
					var oArticle_input = oView.byId("SearchArt");
					oArticle.setVisible(true);
					var oBack = oView.byId("Back");
					oBack.setVisible(false);
					oArticle_input.addEventDelegate({
						"onAfterRendering": function() {
							$('document').ready(function() {
								oArticle_input.focus();
							});
						}
					}, this);
					var obox = oView.byId("Z_BOX");
					obox.setEnabled(false);
					//var fArticle = oView.byId("SearchArt").focus();
					//var oTable = oView.byId("table1");
					//oTable.setVisible(true);
					var Button = oView.byId("TOOL_BAR");
					Button.setVisible(true);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//	promise.reject();
			});
		},

		GetData: function() {
			debugger;
			var oView = this.getView();
			var box = oView.byId("Z_BOX").getValue();
			var material = oView.byId("SearchArt").getValue();
			var TypeCode = oView.byId("TYPECODE").getText();
			var searchString = "A" + "/" + box + "/" + material + "/" + TypeCode;
			material = oView.byId("SearchArt").setValue("");
			//Function mdoule Z_GET_BOX_CONTENT
			var URL = "/sap/opu/odata/sap/ZRETURN_DC_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var lines = newArray.length;
				var sum = parseInt(response.results[0].Menge);
				for (var i = 1; i < response.results.length; i++) {
					if (i < response.results.length) {
						sum = parseInt(response.results[i].Menge) + sum;
					}
				}
				var model2 = new JSONModel({
					"Sum": sum,
					"Products": lines
				});
				oView.setModel(model2, "Model2");
				if (lines > 8) {
					oView.byId("Scroll").setVisible(true);
				}
				var model = new JSONModel({
					"items": newArray
				});
				model.setSizeLimit(100);
				oView.setModel(model, "itemModel");
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				//		promise.reject();
			});
			var OPoText = oView.byId("PoText");
			OPoText.setVisible(false);
			OPoText = oView.byId("searchItem");
			OPoText.setVisible(true);
			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v) {
				if (k !== SelectionMode.Multi) {
					aSelectionModes.push({
						key: k,
						text: v
					});
				}
			});

			var aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v) {
				aSelectionBehaviors.push({
					key: k,
					text: v
				});
			});

			// create JSON model instance
			var oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});

			oView.setModel(oModel, "selectionmodel");
		},

		onSelectionModeChange: function(oEvent) {
			if (oEvent.getParameter("selectedItem").getKey() === "All") {
				return;
			}
			var oTable = this.getView().byId("table1");
			oTable.setSelectionMode(oEvent.getParameter("selectedItem").getKey());
		},

		onBehaviourModeChange: function(oEvent) {
			var oTable = this.getView().byId("table1");
			oTable.setSelectionBehavior(oEvent.getParameter("selectedItem").getKey());
		},

		onSwitchChange: function(oEvent) {
			var oTable = this.getView().byId("table1");
			oTable.setEnableSelectAll(oEvent.getParameter("state"));
		},

		getSelectedIndices: function() {
			var aIndices = this.getView().byId("table1").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "no item selected";
			} else {
				sMsg = aIndices;
			}
			//	MessageToast.show(sMsg);
		},

		getContextByIndexp: function() {
			var oView = this.getView();
			var items = oView.getModel("itemModel");
			var oData = items.getData();
			items.setData(oData);
		},

		clearSelection: function() {
			this.getView().byId("table1").clearSelection();
		},

		getContextByIndexn: function() {
			var self = this;
			var promise = $.Deferred();
			var oView = this.getView();
			var items = oView.getModel("itemModel");
			var oData = items.getData();
			//	oData.items[RowNumber].Qty_int=NewQuantity
			items.setData(oData);
		}
	});
});