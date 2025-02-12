import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillasAportesService {

  constructor(private http: HttpClient) {}

  subirPlanilla(archivo: File, codPatronal: string, mes: string, gestion: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('cod_patronal', codPatronal);
    formData.append('mes', mes);
    formData.append('gestion', gestion);

    return this.http.post(`${environment.url}planillas_aportes/subir`, formData, {
      headers: new HttpHeaders().set('Accept', 'application/json')
    });
  }

  getPlanillas(): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/historial/730-0001`);
  }

  getPlanillaId(id_planilla: number): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/${id_planilla}`);
  }

  getPlanillaDetalle(id_planilla: number): Observable<any> {
    return this.http.get(`${environment.url}planillas_aportes/detalles/${id_planilla}`);
  }

  enviarCorreccionPlanilla(id_planilla: number, trabajadores: any[]): Observable<any> {
    const body = { trabajadores };
    return this.http.put(`${environment.url}planillas_aportes/corregir/${id_planilla}`, body);
  }

  
}
