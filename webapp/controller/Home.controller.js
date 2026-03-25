
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "retosproyecto/util/formatter", 
    "retosproyecto/controller/BaseController"

], function (Controller, MessageToast, JSONModel, Filter, FilterOperator, MessageBox, Fragment, formatter, BaseController) {
    "use strict";

    return BaseController.extend("retosproyecto.controller.Home", {
        formatter: formatter,


        onInit: function () {

            //Indicamos la ruta y funcion loadDynamicCategory
            const oRoute = this.getOwnerComponent().getRouter();
            oRoute.getRoute("RouteHome").attachPatternMatched(this.loadDynamicCategory, this); //Busca la ruta en el manifest y dispara el evento --> cuando salte el evento que ejecute la función
        },

        onAfterRendering: function () {
            this.loadDynamicCategory();
        },

        //Function new modelJSON to add category values from List.Json
        loadDynamicCategory: function () {
            //Recuperamos el modelo listModel
            const aData = this.getListData();
            
            if (aData.length > 0) {
                //Extraer y limpiar duplicados con Set
                const aUniqueCategory = [...new Set(aData.map(item => item.categoria))]; //Spread (concatenar arrays)+ funcion mapeo

                //Mapear a formato Objeto para el ComboBox
                const aFilterData = aUniqueCategory.map(cat => ({
                    categoria: cat
                }));
                //Recuperamos el modelo filtrado
                const oFilterModel = this.getOwnerComponent().getModel("filtradoModel");
                // Añadimos los datos al modelo.
                if (oFilterModel) {
                    oFilterModel.setProperty("/CategoriasSet", aFilterData);
                }
            }
        },


        //Function search filter
        searchMethod: async function () {
            //Type constant and to declare
            const aFilters = [];
            const sRequest = this.byId("inRequest").getValue();
            const sTypology = this.byId("inTypology").getValue();
            const sCategory = this.byId("cbCategorizacion").getSelectedKey();

            if (sRequest) {
                // Create a filter for type ID our JSON file (used constructor filter)
                const oFilter = new Filter("id", FilterOperator.Contains, sRequest);
                aFilters.push(oFilter);
            }
            if (sTypology) {
                aFilters.push(new Filter("tipologia", FilterOperator.Contains, sTypology));

            } if (sCategory) {
                aFilters.push(new Filter("categoria", FilterOperator.EQ, sCategory));
            }

            const oTable = this.byId("idTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            // Message feedback
            if (sRequest) {
                MessageToast.show("Buscando: " + sRequest);
            } else {
                MessageToast.show("Limpiando filtros...");
            }
        },


        // Function fragment
        helpRequest: async function (oEvent) {
            //Save an object Input that trigger event 
            this._oInputSource = oEvent.getSource();

            // Load fragment only if not exists in memory 
            if (!this._pHelpDialog) {
                this._pHelpDialog = await this.loadFragment({
                    name: "retosproyecto.fragment.DialogHelp"
                });
                this.getView().addDependent(this._pHelpDialog);
            }
            // Open dialog
            this._pHelpDialog.open();
        },



        //Logic Button to clear filter
        cleanFilter: function () {
            this.byId("inRequest").setValue("");
            this.byId("inTypology").setValue("");
            this.byId("cbCategorizacion").setSelectedKey("");


            this.searchMethod();

            MessageToast.show("Limpiando filtro");
        },



        onItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("listModel");
            const sIdRequest = oContext.getProperty("id");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                requestId: sIdRequest
            });
        },

        //Call function BaseController:
        create: function () {
            this.openRequestDialog(null);
        }

    

    }); // close Controller.extend
}); // close sap.ui.define