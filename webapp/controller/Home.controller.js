sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("retosproyecto.controller.Home", {
        onInit() {
        }, 

        pulsarDesplegabable: function (oEvent){
            sap.m.MessageToast.show("Abriendo variantes");
        } 
    });
});