sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"

], (BaseController,MessageToast) => {
  "use strict";

  return BaseController.extend("retosproyecto.controller.App", {
      onInit() {
      },
      pulsarDesplegabable: function (oEvent) {
      MessageToast.show("Abriendo variantes");
        }
  });
});