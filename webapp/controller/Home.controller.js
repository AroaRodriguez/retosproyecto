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

        buscar: async function () {
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
        
        //Botón limpiar filtro clear
        limpiarFiltro: function (){
            this.byId("inSolicitud").setValue("");
            this.byId("inTipologia").setValue("");

            this.buscar();

            MessageToast.show("Filtros restablecidos");
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