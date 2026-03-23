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
        formatState: function (sStatus) {
            if (!sStatus) return "None";

            switch (sStatus) {
                case "Aprobado": return "Success"; // Green
                case "Rechazado": return "Error";   // Red
                case "Pendiente": return "Warning"; // Orange
                default: return "Information";      // Blue
            }
        }

    };
});