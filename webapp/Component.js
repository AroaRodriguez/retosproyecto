sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("retosproyecto.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // 1. Llamar al init del padre (Imprescindible)
            UIComponent.prototype.init.apply(this, arguments);

            // 2. Aquí es donde ocurre la magia "fuera" del controlador
            const oListModel = this.getModel("listModel");

            // AttachRequestCompleted es el evento exacto del "momento de carga"
            oListModel.attachRequestCompleted(function () {
                this._prepareDynamicCategories(oListModel);
            }.bind(this));

            this.getRouter().initialize();
        },

        _prepareDynamicCategories: function (oListModel) {
            // Obtenemos los datos recién cargados
            const aRequests = oListModel.getProperty("/SolicitudesSet");

            if (aRequests && aRequests.length > 0) {
                // Algoritmo para categorías únicas
                const aUniqueCategories = [...new Set(aRequests.map(sol => sol.categoria))];
                const aData = aUniqueCategories.map(cat => ({ categoria: cat }));

                // 3. CREAMOS EL MODELO DINÁMICO A NIVEL GLOBAL
                const oFilteredModel = new JSONModel({
                    CategoriasSet: aData
                });

                // Al setearlo en el Componente ('this'), todas las vistas lo heredan
                this.setModel(oFilteredModel, "filtradoModel");
                
                console.log("Categorías generadas globalmente desde Component.js");
            }
        }
    });
});