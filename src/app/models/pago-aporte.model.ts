export interface PagoAporte {
    id?: number; 
    id_planilla_aportes: number;
    fecha_pago: string;
    monto_pagado: number;
    metodo_pago: string;
    comprobante_pago: string;
    observaciones: string;
    foto_comprobante?: string;
  }