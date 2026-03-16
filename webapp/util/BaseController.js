sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("retosproyecto.controller.BaseController", {
        // Atajo para obtener el modelo de la lista
        getListModel: function () {
            return this.getView().getModel("listModel");
        },

        // Atajo para obtener los datos del array principal
        getListData: function () {
            return this.getListModel().getProperty("/SolicitudesSet");
        },

        // Atajo para guardar datos en el modelo
        setListData: function (aData) {
            this.getListModel().setProperty("/SolicitudesSet", aData);
        }
    });
});