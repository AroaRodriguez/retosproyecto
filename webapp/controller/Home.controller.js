sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast,JSONModel) {
    "use strict";

    return Controller.extend("retosproyecto.controller.Home", {
        
        onInit: function () {

            // CREAMOS DATOS DE PRUEBA PARA PODER UTILIZAR LA AYUDA DE DIALOGO
            const oData = {
                TipologiasSet: [
                    { id: "01", nombre: "Individual" },
                    { id: "02", nombre: "Múltiple" },
                    { id: "03", nombre: "Urgente" }
                ]
            };
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel);
            
        },

        pulsarDesplegabable: function (oEvent) {
            MessageToast.show("Abriendo variantes");
        },

        buscar: function () {
            const sSolicitud = this.byId("inSolicitud").getValue();
            MessageToast.show("Buscando solicitud: " + sSolicitud);
        },

        // Lógica del fragmento 
        ayudaRequerida: async function (oEvent) {
            //Guardamos el objeto Input que disparó el evento
            this._oInputSource = oEvent.getSource(); 

            // Cargamos el fragmento solo si no existe ya en memoria
            if (!this._pAyudaDialog) {
                this._pAyudaDialog = await this.loadFragment({
                    name: "retosproyecto.fragment.DialogHelp"   
                });
                this.getView().addDependent(this._pAyudaDialog);
            }    
            // Abrimos el diálogo
            this._pAyudaDialog.open();
        },

        // Función necesaria para cuando el usuario selecciona algo en el diálogo
        onValueHelpConfirm: function (oEvent) {
            const selectItem = oEvent.getParameter("selectedItem");
            if (selectItem) {
                this._oInputSource.setValue(selectItem.getTitle());
            }
        }, 

        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            MessageToast.show("Filtrando por: " + sValue);
            // Aquí iría la lógica de filtrado de la lista
        },

        onValueHelpClose: function () {
            
        }


    }); // Cierre del Controller.extend
}); // Cierre del sap.ui.define