sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel", 
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast,JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("retosproyecto.controller.Home", {
        
        onInit: function () {

        },

        buscar: function () {
            //Declaración constantes
            const sSolicitud = this.byId("inSolicitud").getValue();
            const sTipologia = this.byId("inTipologia").getValue();
            const sCategorizacion = this.byId("cbCategorizacion").getValue();
            const aFilters = [];

            if (sSolicitud) {
                // Creamos un filtro para el campo "id" de nuestro JSON (constructor Filter)
                const oFilter = new Filter("id", FilterOperator.Contains, sSolicitud);
                aFilters.push(oFilter);
            } 
            if (sTipologia){
                aFilters.push(new Filter("tipologia", FilterOperator.Contains, sTipologia));

            } if (sCategorizacion) {
               aFilters.push(new Filter("categoria", FilterOperator.Contains, sCategorizacion)); 
            }


            const oTable = this.byId("idTable");
            const oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters); 

            // Mensaje de feedback
            if (sSolicitud) {
                MessageToast.show("Buscando: " + sSolicitud);
            } else {
                MessageToast.show("Limpiando filtros...");
            }
        }, 




         // El formateador
        formatState: function (sEstado) {
            if (!sEstado) return "None";
            
            switch (sEstado) {
                case "Aprobado": return "Success"; // Verde
                case "Rechazado": return "Error";   // Rojo
                case "Pendiente": return "Warning"; // Naranja
                default: return "Information";      // Azul
            }
        },

        onItemPress: function (oEvent) {
            MessageToast.show("Detalle de la solicitud seleccionado");
        }

    }); // Cierre del Controller.extend
}); // Cierre del sap.ui.define