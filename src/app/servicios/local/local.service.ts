import { HttpClient } from '@angular/common/http';
import { Injectable , signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

private token = signal("");
private restriccion:any = signal([]);
  constructor(private http: HttpClient) { }
setLocalStorage(key:string ,token:string){
  localStorage.setItem(key, token);
}
getLocalStorage(key:string):string | null{
  return localStorage.getItem(key);
}
setLocalStorageObjeto(key:string ,restricciones:any){
  localStorage.setItem(key,JSON.stringify(restricciones));
}

deleteStorage(){
localStorage.removeItem("usuario");
localStorage.removeItem("restriccion");
localStorage.removeItem("recursos");
localStorage.removeItem("token");
localStorage.removeItem("persona");
localStorage.removeItem("usuarioRestriccion");
}

}
