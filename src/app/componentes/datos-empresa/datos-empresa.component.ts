import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../../servicios/empresa/empresa.service';
import { MessageService } from 'primeng/api';
import { LocalService } from '../../servicios/local/local.service';

@Component({
  selector: 'app-datos-empresa',
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.css'],
  providers: [MessageService]
})
export class DatosEmpresaComponent implements OnInit {
  empresa: any = null;
  numPatronal: string | null = null; 
  listaEmpresas: any[] = []; 
  totalTrabajadores: number = 0; 

  constructor(
    private empresaService: EmpresaService,
    private localService: LocalService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerNumeroPatronal();
    if (this.numPatronal) {
      this.obtenerDatosEmpresa(this.numPatronal);
    } else {
      console.warn('Número patronal no encontrado en localStorage.');
    }

    this.obtenerTodasLasEmpresas();

    setTimeout(() => {
      this.mostrarAlerta();
    }, 500);
  }

  obtenerNumeroPatronal() {
    try {
      const usuarioRestriccion = JSON.parse(this.localService.getLocalStorage('usuarioRestriccion') || '{}');
      this.numPatronal = usuarioRestriccion?.numPatronalEmpresa || null;

      if (!this.numPatronal) {
        console.error('⚠️ No se encontró el número patronal en localStorage.');
      } else {
        console.log(`✅ Número patronal obtenido: ${this.numPatronal}`);
      }
    } catch (error) {
      console.error('❌ Error al obtener número patronal:', error);
    }
  }

  obtenerDatosEmpresa(numPatronal: string) {
    console.log(`🔍 Buscando empresa con número patronal: ${numPatronal}`);
  
    this.empresaService.getEmpresaByNroPatronal(numPatronal).subscribe(
      (response) => {
        console.log("📡 Respuesta de la API:", response);
  
        if (response && response.length > 0) {
          this.empresa = response[0];
          console.log("🏢 Empresa asignada:", this.empresa);
  

          this.calcularTotalTrabajadores();
        } else {
          console.warn('⚠️ No se encontró información para este número patronal.');
        }
      },
      (error) => {
        console.error('❌ Error al obtener datos de la empresa:', error);
      }
    );
  }
  

obtenerTodasLasEmpresas() {
  this.empresaService.getAllEmpresas().subscribe(
    (response) => {
      console.log("📡 Lista completa de empresas recibida:", response);
      this.listaEmpresas = response; // Guarda la lista en una variable

      if (!this.listaEmpresas || this.listaEmpresas.length === 0) {
        console.warn("⚠️ No se recibieron empresas desde la API.");
        return;
      }

      if (this.empresa) {
        this.calcularTotalTrabajadores();
      }
    },
    (error) => {
      console.error("❌ Error al obtener la lista de empresas:", error);
    }
  );
}

calcularTotalTrabajadores() {
  if (!this.empresa || !this.listaEmpresas.length) {
    console.warn("⚠️ No se encontraron datos de la empresa o de las empresas.");
    return;
  }

  console.log("🏢 Empresa principal:", this.empresa);

  //  (Ignora los primeros 3 caracteres)
  const codigoBase = this.empresa.EMP_NPATRONAL.slice(3); // "730-0001"
  console.log(`🔍 Código base de la empresa: ${codigoBase}`);

  // Buscar TODAS las regionales con el mismo cod
  const regionales = this.listaEmpresas.filter(emp => emp.EMP_NPATRONAL.endsWith(codigoBase));

  console.log(`🔍 Se encontraron ${regionales.length} regionales de la empresa ${this.empresa.EMP_NOM}`);

  // Sumar la cantidad total de trabajadores
  this.totalTrabajadores = regionales.reduce((total, emp) => total + (emp.EMP_NTRAB || 0), 0);

  console.log(`👥 Total de trabajadores en todas las regionales de ${this.empresa.EMP_NOM}:`, this.totalTrabajadores);
}




  mostrarAlerta() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aviso Importante',
      detail:
        'Señor empleador, no olvide mantener actualizados sus datos para evitar multas. En caso de no tener actualizados sus datos, favor regularizar en la Unidad de Afiliaciones de la Caja Bancaria Estatal de Salud.',
      life: 10000
    });
  }
}
