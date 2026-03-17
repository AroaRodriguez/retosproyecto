
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel", 
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator", 
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast,JSONModel, Filter, FilterOperator, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("retosproyecto.controller.Home", {
        
        onInit: function () {  
        },

        //Función para generar categorias del modelo 
        generarCategorias: function (oListModel) {
            //Obtenemos el array con todas las solicitudes de List.json
            const aSolictiudes = oListModel.getProperty("/SolicitudesSet");
            if(!aSolictiudes)return;
            
            //Mapeamos para sacar solo los nombres de categoría y usamos Set para limpiar duplicados
            const aCategoriasUnicas = [...new Set (aSolictiudes.map (sol=>sol.categoria))];

            //Formateamos el array para que lo entienda el comboBox
            const aDatosComboBox = aCategoriasUnicas.map (cat => {
                return {categoria: cat}; //array

            })

            const oFiltradoModel = new JSONModel ({
                CategoriasSet: aDatosComboBox  
            });

            this.getView().setModel(oFiltradoModel,"filtrado");
            
        },



        //Función filtros 
        buscar: async function () {
            //Declaración constantes
            const sSolicitud = this.byId("inSolicitud").getValue();
            const sTipologia = this.byId("inTipologia").getValue();
            const sCategorizacion = this.byId("cbCategorizacion").getSelectedKey();
            const aFilters = [];

            if (sSolicitud) {
                // Creamos un filtro para el campo "id" de nuestro JSON (constructor Filter)
                const oFilter = new Filter("id", FilterOperator.Contains, sSolicitud);
                aFilters.push(oFilter);
            } 
            if (sTipologia){
                aFilters.push(new Filter("tipologia", FilterOperator.Contains, sTipologia));

            } if (sCategorizacion) {
               aFilters.push(new Filter("categoria", FilterOperator.EQ, sCategorizacion)); 
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
        },  //Modificar y añadir un nuevo modelo JSON

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
            MessageToast.show("Detalle de la solicitud seleccionado");
        },

        //---------------------------------------------------OPERACIONES CRUD---------------------------------------------------------------------
        
        //Función CRUD Eliminar
        eliminar: function(){
            //Pasamos la tabla y los datos seleccionados
            const oTable = this.byId("idTable");
            const aSelectedItems = oTable.getSelectedItems();
            //Si no seleccionamos nada, mostrar un mensaje. 
            if (aSelectedItems.length ===0) {
                MessageToast.show("Selecciona al menos una solicitud para eliminar");
                return;
            } else {
                     //Al seleccionar, mostramos un mensaje si estamos seguros de eliminar.
            MessageBox.confirm("Estás seguro que deseas eliminar los registros seleccionados?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                    const oModel = this.getView().getModel("listModel");
                    const aData = oModel.getProperty("/SolicitudesSet");

                    //Filtramos para quedarnos con los que no están seleccionados:
                    const aSelectContexts = aSelectedItems.map(oItem =>oItem.getBindingContext("listModel").getObject());
                    const aNewData = aData.filter(oRow => !aSelectContexts.includes(oRow));
                    //Pasamos los nuevos parametros    
                    oModel.setProperty("/SolicitudesSet",aNewData);
                    oTable.removeSelections();
                    MessageToast.show("Eliminado con éxito");

                    
                } //Cierre IF
            }.bind(this) //Cierre metodo onClose
            }); //Cierre messageBox
            }
            }, //cierre función
            
            //Función CRUD crear
            crear: function (){
             const oView = this.getView();
            const oModel = this.getView().getModel("listModel");

                //Creamos el dialog:
                if (!this._oDialog) {
                    Fragment.load({
                        id: oView.getId(), 
                        name: "retosproyecto.fragment.NewList",
                        controller: this
                    }) .then(function (oDialog) {
                        this._oDialog = oDialog;
                        oView.addDependent(this._oDialog);
                        this._oDialog.setBindingContext(null, "listModel"); // Modo Crear
                        this._oDialog.open();
                    }.bind(this));
                } else {
                    this._oDialog.setBindingContext(null, "listModel");
                    this._oDialog.open();
                }
            }, 
            //Cerrar el dialogo sin introducir nada.
            CerrarDialogNuevo: function(){
                this._oDialog.close();
            }, 

            //Guardar el dialogo
            GuardarNuevo: function () {
                const oModel = this.getView().getModel("listModel");
                const oContext = this._oDialog.getBindingContext("listModel");
                
                if (!oContext) {
                const aData = oModel.getProperty("/SolicitudesSet");
                const oNuevaSolicitud = {
                    id: this.byId("newId").getValue(), 
                    tipologia: this.byId("newTipologia").getValue(),
                    categoria: this.byId("newCategoria").getValue(),
                    estado: this.byId("newEstado").getValue(), 
                    precio: parseFloat(this.byId("newPrecio").getValue()) || 0
                };

                if (!oNuevaSolicitud.id) {
                    MessageToast.show("El ID es obligatorio");
                    return;
                }

                //Agregamos al array y actualizamos el modelo listModel.json:
                aData.push(oNuevaSolicitud);
                oModel.setProperty("/SolicitudesSet", aData);
                MessageToast.show("Solicitud " + oNuevaSolicitud.id + " creada con éxito");

                MessageToast("Solicitud" + oNuevaSolicitud + "creada correctamente");
            } else {
                MessageToast.show("Solicitud " + oContext.getProperty("id") + " actualizada");
            }

                //Cerramos el dialogo:
                this.CerrarDialogNuevo();
            }, 


            //Función CRUD editar
            editar: function(){

                const oTable = this.byId("idTable");
                const aSelectedItems = oTable.getSelectedItems();
                
                //Si selecciona más de una fila (es decir, el selected es diferente a 1)
                if (aSelectedItems.length !==1) {

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
                        //OJO!! enlazamos dialogo con la vista seleccionada
                        this._oDialog.setBindingContext(oContext, "listModel");
                        this._oDialog.open();   
                    } .bind(this));

                } else {
                    this._oDialog.setBindingContext(oContext, "listModel");
                    this._oDialog.open();
                }
            }
    }); // Cierre del Controller.extend
}); // Cierre del sap.ui.define