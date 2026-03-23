sap.ui.define([], function () {
    "use strict";

    return {
        
        // Format price
        formatPrice: function (sPrice) {
            if (!sPrice) {
                return "0.00";
            }

            const fPrice = parseFloat(sPrice);
            return fPrice.toFixed(2);
        },

        // Format state 
        formatState: function (sEstado) {
            if (!sEstado) return "None";

            switch (sEstado) {
                case "Aprobado": return "Success"; // Verde
                case "Rechazado": return "Error";   // Rojo
                case "Pendiente": return "Warning"; // Naranja
                default: return "Information";      // Azul
            }
        }

    };
});