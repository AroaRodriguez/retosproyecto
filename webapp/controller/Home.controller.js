
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/util/File"

], function (Controller, MessageToast, JSONModel, Filter, FilterOperator, MessageBox, Fragment, File) {
    "use strict";

    return Controller.extend("retosproyecto.controller.Home", {

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
            const oListModel = this.getOwnerComponent().getModel("listModel");
            const aData = oListModel.getProperty("/SolicitudesSet");

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



        // Añadir los colores según tipologia
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
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("listModel");
            const sIdRequest = oContext.getProperty("id");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                requestId: sIdRequest
            });
        },

        //---------------------------------------------------CRUD METHOD---------------------------------------------------------------------

        //Function CRUD detele
        delete: function () {
            //Selected data and put in the table
            const oTable = this.byId("idTable");
            const aSelectedItems = oTable.getSelectedItems();
            //If not selected nothing, show a message. 
            if (aSelectedItems.length === 0) {
                MessageToast.show("Selecciona al menos una solicitud para eliminar");
                return;
            } else {
                //If selected, show a new message: would sure to delete.
                MessageBox.confirm("Estás seguro que deseas eliminar los registros seleccionados?", {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            const oModel = this.getView().getModel("listModel");
                            const aData = oModel.getProperty("/SolicitudesSet");

                            //We filter to keep those that are not selected:
                            const aSelectContexts = aSelectedItems.map(oItem => oItem.getBindingContext("listModel").getObject());
                            const aNewData = aData.filter(oRow => !aSelectContexts.includes(oRow));
                            //New parametres    
                            oModel.setProperty("/SolicitudesSet", aNewData);
                            oTable.removeSelections();
                            MessageToast.show("Eliminado con éxito");


                        } //close IF
                    }.bind(this) //close method closeDialog
                }); //close messageBox
            }
        }, //close function

        //Function create CRUD
        create: function () {
            const oView = this.getView();
            const oModel = this.getView().getModel("listModel");

            //Create the dialog:
            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "retosproyecto.fragment.NewList",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(this._oDialog);
                    this._oDialog.setBindingContext(null, "listModel"); // Mode create
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.setBindingContext(null, "listModel");
                this._oDialog.open();
            }
        },
        //Function close dialog if you not put information
        newDialogClose: function () {
            this._oDialog.close();
        },

        //Function CRUD Save dialog
        newSave: function () {
            const oModel = this.getView().getModel("listModel");
            const oContext = this._oDialog.getBindingContext("listModel");

            if (!oContext) {
                const aData = oModel.getProperty("/SolicitudesSet");
                const oNewRequest = {
                    id: this.byId("newId").getValue(),
                    tipologia: this.byId("newTypology").getValue(),
                    categoria: this.byId("newCategory").getValue(),
                    estado: this.byId("newStatus").getValue(),
                    precio: parseFloat(this.byId("newPrice").getValue()) || 0
                };

                if (!oNewRequest.id) {
                    MessageToast.show("El ID es obligatorio");
                    return;
                }

                //We add to the array and update the model listModel.json
                aData.push(oNewRequest);
                oModel.setProperty("/SolicitudesSet", aData);
                MessageToast.show("Solicitud " + oNewRequest.id + " creada con éxito");

                MessageToast("Solicitud" + oNewRequest + "creada correctamente");
            } else {
                MessageToast.show("Solicitud " + oContext.getProperty("id") + " actualizada");
            }

            //Call the function close dialog
            this.newDialogClose();
        },


        //Function CRUD edit
        edit: function () {

            const oTable = this.byId("idTable");
            const aSelectedItems = oTable.getSelectedItems();

            //If you select more than one row (that is, the selected is different from 1)
            if (aSelectedItems.length !== 1) {

                MessageToast.show("Por favor, selecciona exactamente una fila para editar");
                return;
            }

            const oSelectedItem = aSelectedItems[0];
            const oContext = oSelectedItem.getBindingContext("listModel");
            const oView = this.getView();

            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "retosoproyecto.fragment.NewList",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(this._oDialog);
                    //Warning!! Linking the dialog with the selected view
                    this._oDialog.setBindingContext(oContext, "listModel");
                    this._oDialog.open();
                }.bind(this));

            } else {
                this._oDialog.setBindingContext(oContext, "listModel");
                this._oDialog.open();
            }
        }
    }); // close Controller.extend
}); // close sap.ui.define