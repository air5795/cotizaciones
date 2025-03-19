import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoAporte } from '../../models/pago-aporte.model';

@Injectable({
  providedIn: 'root'
})
export class PlanillasAportesService {

  constructor(private http: HttpClient) {}

/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* PLANILLAS MENSUALES DE APORTES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  subirPlanilla(archivo: File, codPatronal: string, mes: string, empresa: string, tipo_empresa: string, gestion: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('cod_patronal', codPatronal);
    formData.append('gestion', gestion);
    formData.append('mes', mes);
    formData.append('empresa', empresa);
    formData.append('tipo_empresa', tipo_empresa);
    

    return this.http.post(`${environment.url}planillas_aportes/subir`, formData, {
      headers: new HttpHeaders().set('Accept', 'application/json')
    });
  }

  actualizarDetallesPlanilla(id_planilla: number, trabajadores: any[]): Observable<any> {
    return this.http.put(`${environment.url}planillas_aportes/detalles/${id_planilla}`, { trabajadores });
  }

  getPlanillas(cod_patronal: string , pagina: number = 0, limite: number = 10, busqueda: string = '' , mes?:string, anio?:string): Observable<any> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('limite', limite);
    
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (mes) {
      params = params.set('mes', mes);
    }

    if (anio) {
      params = params.set('anio', anio);
    }

    console.log('Parámetros de la solicitud:', params.toString());
    return this.http.get(`${environment.url}planillas_aportes/historial/${cod_patronal}`, { params });
  }

  obtenerHistorialAdmin(pagina: number = 0, limite: number = 10, busqueda: string = '' , mes?:string, anio?:string , estado?:number): Observable<any> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('limite', limite);
    
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (mes) {
      params = params.set('mes', mes);
    }

    if (anio) {
      params = params.set('anio', anio);
    }
    if (estado !== undefined && estado !== null) {
      params = params.set('estado', estado);
    }

    console.log('Parámetros de la solicitud:', params.toString());
    return this.http.get(`${environment.url}planillas_aportes/historialAdmin`, { params });
  }

  getPlanillasTodoHistorial(pagina: number = 0, limite: number = 10, busqueda: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina)  
      .set('limite', limite);
  
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
  
    console.log('Parámetros de la solicitud:', params.toString());
  
    return this.http.get(`${environment.url}planillas_aportes/historial-completo`, { params });
  }

  getPlanillasTodo(): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/historial`);
  }
  
  getPlanillaId(id_planilla: number): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/${id_planilla}`);
  }

  getPlanillaDetalle(id_planilla: number,pagina: number = 1,limite: number = 10,busqueda: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get(`${environment.url}planillas_aportes/detalles/${id_planilla}`, { params });
  }

  enviarCorreccionPlanilla(id_planilla: number, trabajadores: any[]): Observable<any> {
    const body = { trabajadores };
    return this.http.put(`${environment.url}planillas_aportes/corregir/${id_planilla}`, body);
  }

  actualizarEstadoPlanilla(id_planilla: number, estado: number, observaciones?: string): Observable<any> {
    const body = { estado, observaciones };
    return this.http.put(`${environment.url}planillas_aportes/estado/${id_planilla}`, body);
  }

  actualizarEstadoAPendiente(idPlanilla: number) {
    return this.http.put(`${environment.url}planillas_aportes/estado/pendiente/${idPlanilla}`, {});
  }

  eliminarDetallesPlanilla(id_planilla: number): Observable<any> {
    return this.http.delete(`${environment.url}planillas_aportes/detalles/${id_planilla}`);
  }


  compararPlanillas(cod_patronal: string, gestion: string, mesAnterior: string, mesActual: string): Observable<any> {
    return this.http.get<any>(`${environment.url}planillas_aportes/comparar/${cod_patronal}/${gestion}/${mesAnterior}/${mesActual}`);
  }

  generarReporteBajas(id_planilla: number,cod_patronal: string, mesAnterior: string, mesActual: string, gestion: string): Observable<Blob> {
    return this.http.get(`${environment.url}planillas_aportes/reporte-bajas/${id_planilla}/${cod_patronal}/${mesAnterior}/${mesActual}/${gestion}`, {
      responseType: 'blob' 
    });
  }

  generarReporteResumen(id_planilla: number): Observable<Blob> {
    return this.http.get(`${environment.url}planillas_aportes/reporte-planilla/${id_planilla}`, {
      responseType: 'blob' 
    });
  }

  obtenerDatosPlanillaPorRegional(id_planilla: number): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/datos-planilla/${id_planilla}`);
  }

/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* PAGOS PLANILLAS MENSUALES DE APORTES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  // 1. Crear un pago con imagen
  createPago(pagoData: any, file: File): Observable<PagoAporte> {
    const formData = new FormData();
    formData.append('id_planilla_aportes', pagoData.id_planilla_aportes);
    formData.append('fecha_pago', pagoData.fecha_pago);
    formData.append('monto_pagado', pagoData.monto_pagado);
    formData.append('metodo_pago', pagoData.metodo_pago);
    formData.append('comprobante_pago', pagoData.comprobante_pago);
    formData.append('observaciones', pagoData.observaciones);
    if (file) {
      formData.append('foto_comprobante', file, file.name); 
    }

    return this.http.post<any>(`${environment.url}pagos-aportes/create`, formData);
  }

// 2. Listar todos los pagos
findAll(): Observable<PagoAporte[]> {
  return this.http.get<PagoAporte[]>(`${environment.url}pagos-aportes`);
}

// 3. Listar pagos por id_planilla_aportes (ajustado para devolver una lista)
findByIdPlanilla(id: number): Observable<PagoAporte[]> {
  return this.http.get<PagoAporte[]>(`${environment.url}pagos-aportes/by-id/${id}`);
}
  
  
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* LIQUIDACION PLANILLAS MENSUALES DE APORTES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */


// 1.- Calcular aportes
calcularAportes(id: number): Observable<any> {
  return this.http.post(`${environment.url}planillas_aportes/calcular/${id}`, {});
}

}
