import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = 'http://localhost:4000/api/v1/servicios-externos';

  constructor(private http: HttpClient) {}

  getEmpresaByNroPatronal(nroPatronal: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetEmpresaByNroPatronal/${nroPatronal}`);
  }

  getAllEmpresas(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/GetAllEmpresas`);
  }
}
