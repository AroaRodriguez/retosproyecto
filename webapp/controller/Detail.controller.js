sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History" // Librería obligatoria para el botón "Atrás"
], function (Controller, History) {
    "use strict";

    return Controller.extend("retosproyecto.controller.Detail", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this.loadInformation, this);
        },


        loadInformation: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sRequestId = oArguments.requestId;
            const oModel = this.getOwnerComponent().getModel("listModel");
            const aData = oModel.getProperty("/SolicitudesSet");


            if (aData.length > 0) {
                const iIndex = aData.findIndex(item => item.id === sRequestId);

                if (iIndex !== -1) {

                    const sPath = "/SolicitudesSet/" + iIndex;
                    this.getView().bindElement({
                        path: sPath,
                        model: "listModel"
                    });

                } else {
                    console.error("No se encontró la solicitud con ID:", sRequestId);
                }
            } else {

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
        }
    });
});