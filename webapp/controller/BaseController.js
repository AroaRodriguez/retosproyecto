sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("retosproyecto.controller.BaseController", {
        
        //Function cleanFormulary
        cleanFormulary: function () {
            const aFieldsIds = ["newId", "newTypology", "newPrice"];

            aFieldsIds.forEach(id => {
                const oControl = this.byId(id);

                if (oControl) {
                    oControl.setValue("");
                    oControl.setValueState("None");
                }

            });

            const oCat = this.byId("newCategory");
            if (oCat) {
                oCat.setSelectedKey("");
                oCat.setValueState("None");
            }

            const oStat = this.byId("newStatus");

            if (oStat) {
                oStat.setSelectedKey("");
                oStat.setValueState("None");
            }

        },
        
        //Function validate formulary 
         validationFormulary: function (oEvent) {
            let bIsValid = true;
            const oModel = this.getView().getModel("listModel");
            const aData = oModel ? oModel.getProperty("/SolicitudesSet") || [] : [];

            const isEditing = this.byId("newId") && !this.byId("newId").getEditable();


            const aRules = [
                {
                    id: "newId",
                    check: (val) => {
                        if (!val || val.length !== 4) return false;
                        if (!isEditing){ 
                        const bExists = aData.some(item => item.id === val); //If id exists, couldn't create
                        return !bExists;    
                        }
                        return true;
                    },
                    msg: "El ID es obligatorio y único, debe tener al menos 4 caracteres"
                },
                {
                    id: "newPrice",
                    check: (val) => val && parseFloat(val) > 0,
                    msg: "El precio es obligatorio y debe ser mayor a 0"
                },
                {
                    id: "newTypology",
                    check: (val) => !val || val.length >= 4,
                    msg: "Si indicas tipología, debe tener al menos 4 caracteres"
                }
            ];

            let aFieldsToValidate = aRules;

            if (oEvent && oEvent.getSource) {
                const sControlId = oEvent.getSource().getId();
                aFieldsToValidate = aRules.filter(rule => sControlId.includes(rule.id));
            }

            aFieldsToValidate.forEach(rule => {
                const oControl = this.byId(rule.id);

                if (oControl) {
                    const sValue = oControl.getValue ? oControl.getValue().trim() : "";
                    if (!rule.check(sValue)) {
                        oControl.setValueState("Error");
                        oControl.setValueStateText(rule.msg);
                        bIsValid = false;
                    } else {
                        oControl.setValueState("Success");
                    }
                }
            });
            return bIsValid;
        },

        openRequestDialog: function (oContext) {
            const oView = this.getView();
            this.cleanFormulary(); 

            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "retosproyecto.fragment.NewList",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(this._oDialog);
                    this.prepareDialog(oContext);
                }.bind(this));
            } else {
               this.prepareDialog(oContext);
            }
        },

        prepareDialog: function (oContext) {
            this._editContext = oContext;
            this.cleanFormulary();

            if (oContext){
                this.byId("newId").setValue(oContext.getProperty("id"));
                this.byId("newId").setEditable(false);
                this.byId("newTypology").setValue(oContext.getProperty("tipologia"));
                this.byId("newCategory").setSelectedKey(oContext.getProperty("categoria"));
                this.byId("newStatus").setSelectedKey(oContext.getProperty("estado"));
                this.byId("newPrice").setValue(oContext.getProperty("precio"));
            } else {
                this._editContext = null;
                this.byId("newId").setEditable(true);

            }
            this._oDialog.open();
        },


        //--------------------------CRUD FUNCTIONS-----------------------------------------------
        
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

        //Function close dialog if you not put information
        newDialogClose: function () {
            this.cleanFormulary();
            if (this._oDialog){
                this._oDialog.close();
            }
            this.cleanFormulary();
            this._editContext = null;
            
        },

        //Function CRUD Save dialog
        newSave: function () {
            const oModel = this.getView().getModel("listModel");

            const oContext = this._editContext;

            if (!this.validationFormulary()) {
                MessageToast.show("Revisa los campos marcados en rojo antes de guardar");
                return;
            }

            if (!oContext) {
                const aData = oModel.getProperty("/SolicitudesSet");
                const oNewRequest = {
                    id: this.byId("newId").getValue(),
                    tipologia: this.byId("newTypology").getValue().trim(),
                    categoria: this.byId("newCategory").getSelectedKey(),
                    estado: this.byId("newStatus").getSelectedKey(),
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
            } else {
                //Update in edit method
                const sPath = oContext.getPath();
                oModel.setProperty(sPath+"/tipologia", this.byId("newTypology").getValue().trim());
                oModel.setProperty(sPath+"/categoria", this.byId("newCategory").getSelectedKey());
                oModel.setProperty(sPath+"/estado", this.byId("newStatus").getSelectedKey());
                oModel.setProperty(sPath+"/precio", parseFloat(this.byId("newPrice").getValue()||0));

                MessageToast.show("Solicitud " + oContext.getProperty("id") + " actualizada");
            }

            //Call the function close dialog
            this.newDialogClose();
        }
    });
});