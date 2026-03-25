sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History", 
    "sap/m/MessageToast", 
    "retosproyecto/util/formatter", 
    "retosproyecto/controller/BaseController", 
], function (Controller, History, MessageToast, formatter, BaseController) {
    "use strict";
    

    return BaseController.extend("retosproyecto.controller.Detail", {
        formatter: formatter, 

        onInit: function () {
            //Route
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this.loadInformation, this);
        },

        //Function loadInformation

        loadInformation: function (oEvent) {
            //Extract route arguments and retrieve the JSON model Data. 
            const oArguments = oEvent.getParameter("arguments");
            const sRequestId = oArguments.requestId;
            const oModel = this.getOwnerComponent().getModel("listModel");
            const aData = oModel.getProperty("/SolicitudesSet");

            //Check if the data array is populated
            if (aData.length > 0) {
                //Find the extract index of the requested item within the array
                const iIndex = aData.findIndex(item => item.id === sRequestId);
                //If the item exists (findIndex doesn't return -1)
                if (iIndex !== -1) {
                    //Construct the binding path and bind the view to this specific context
                    const sPath = "/SolicitudesSet/" + iIndex;
                    this.getView().bindElement({
                        path: sPath,
                        model: "listModel"
                    });

                } else {
                    //Log and error if the specific ID is not found in the array
                    console.error("No se encontró la solicitud con ID:", sRequestId);
                }
            } else {
                MessageToast.show("No se ha encontrado ningun valor JSOn");
            }
        },

        //Function route to go back in the page
        onNavBack: function () {
            //Instance the history of navegation
            const oHistory = History.getInstance();
            //Ask: Had an other page before this?
            const sPreviousHash = oHistory.getPreviousHash();
            //if has history 
            if (sPreviousHash !== undefined) {
                window.history.go(-1); //go back

            } else { //if not
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteHome", {}, true); //force to navegation in "RouteHome" in manifest document. 
            }
        }, 

        EditDetailInfo: function () {
            const oContext = this.getView().getBindingContext("listModel");

            if (oContext){

                this.openRequestDialog(oContext);
                
            }

        }


    });
});