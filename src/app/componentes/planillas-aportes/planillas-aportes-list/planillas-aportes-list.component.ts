import { Component } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalService } from '../../../servicios/local/local.service';
import { EmpresaService } from '../../../servicios/empresa/empresa.service';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-planillas-aportes-list',
  templateUrl: './planillas-aportes-list.component.html',
  styleUrl: './planillas-aportes-list.component.css'
})
export class PlanillasAportesListComponent {

planillas: any[] = [];
loading = true;
empresa: any = null;
mostrarModal = false;
activeIndex: number = 0;  // Paso actual en el Stepper
archivoSeleccionado: File | null = null;
mesSeleccionado: string = '';
gestiones: { label: string; value: number }[] = []; // Gestiones disponibles para seleccionar en modal stepper
gestionSeleccionada: number | null = null;
planillaDatos: any[] = [];  // Datos extraídos de la planilla Excel para el modal steper
numPatronal: string | null = null;
nomEmpresa: string | null = null;

meses = [
  { label: 'ENERO', value: 'ENERO' },
  { label: 'FEBRERO', value: 'FEBRERO' },
  { label: 'MARZO', value: 'MARZO' },
  { label: 'ABRIL', value: 'ABRIL' },
  { label: 'MAYO', value: 'MAYO' },
  { label: 'JUNIO', value: 'JUNIO' },
  { label: 'JULIO', value: 'JULIO' },
  { label: 'AGOSTO', value: 'AGOSTO' },
  { label: 'SEPTIEMBRE', value: 'SEPTIEMBRE' },
  { label: 'OCTUBRE', value: 'OCTUBRE' },
  { label: 'NOVIEMBRE', value: 'NOVIEMBRE' },
  { label: 'DICIEMBRE', value: 'DICIEMBRE' }
];

steps = [
  { label: 'Elegir Mes y Gestión' },
  { label: 'Importar Planilla' },
  { label: 'Verificar Datos' }
];


  constructor(
    private planillasService: PlanillasAportesService,
    private localService: LocalService,
    private empresaService: EmpresaService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.generarGestiones();

  
    this.obtenerNumeroPatronal();
    if (this.numPatronal) {
      this.obtenerDatosEmpresa(this.numPatronal);
    } else {
      console.warn('Número patronal no encontrado en localStorage.');
    }

    if (this.numPatronal) {
      this.obtenerPlanillas(this.numPatronal.slice(3));
      console.log('🔍 Buscando planillas de aportes para:', this.numPatronal);
    } else {
      console.error('⚠️ El número patronal no es válido.');
    }
  }
  

    // Generar el arreglo de gestiones
    generarGestiones() {
      const currentYear = new Date().getFullYear();
      // Crear los tres años: el actual, el anterior y el siguiente
      this.gestiones = [
        { label: (currentYear - 1).toString(), value: currentYear - 1 },
        { label: currentYear.toString(), value: currentYear },
        { label: (currentYear + 1).toString(), value: currentYear + 1 }
      ];
    }

    obtenerNumeroPatronal() {
      try {
        const usuarioRestriccion = JSON.parse(this.localService.getLocalStorage('usuarioRestriccion') || '{}');
        this.numPatronal = usuarioRestriccion?.numPatronalEmpresa || null;
        this.nomEmpresa = usuarioRestriccion?.empresa || null;
        if (this.numPatronal) {
          console.log('COD patronal:', this.numPatronal.slice(3));
          console.log('Nombre empresa:', this.nomEmpresa);
        }
  
        if (!this.numPatronal) {
          console.error('⚠️ No se encontró el número patronal en localStorage.');
        } else {
          console.log(`✅ Número patronal obtenido: ${this.numPatronal}`);
        }
      } catch (error) {
        console.error('❌ Error al obtener número patronal:', error);
      }
    }

    obtenerPlanillas(cod_patronal: string) {
      if (!cod_patronal) {
        console.error('⚠️ El número patronal no es válido.');
        return;
      }
      
      this.planillasService.getPlanillas(cod_patronal).subscribe({
        next: (data) => {
          this.planillas = data.planillas;
          console.log('Planillas de Aportes:', this.planillas);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener planillas:', err);
          this.loading = false;
        }
      });
    }
    

    obtenerDatosEmpresa(numPatronal: string) {
      console.log(`🔍 Buscando empresa con número patronal: ${numPatronal}`);
    
      this.empresaService.getEmpresaByNroPatronal(numPatronal).subscribe(
        (response) => {
          console.log("📡 Respuesta de la API:", response);
    
          if (response && response.length > 0) {
            this.empresa = response[0];
            console.log("🏢 Empresa asignada:", this.empresa);
    
          } else {
            console.warn('⚠️ No se encontró información para este número patronal.');
          }
        },
        (error) => {
          console.error('❌ Error al obtener datos de la empresa:', error);
        }
      );
    }



  verDetalle(id_planilla: number) {
    this.router.navigate(['/cotizaciones/planillas-aportes', id_planilla]);
  }

  // 1️⃣ Ir al siguiente paso en el Stepper
  nextStep() {
    this.activeIndex++;
  }

  // 2️⃣ Ir al paso anterior en el Stepper
  prevStep() {
    this.activeIndex--;
  }

  // 3️⃣ Guardar el archivo seleccionado
  seleccionarArchivo(event: any) {
    this.archivoSeleccionado = event.target.files[0];
    if (this.archivoSeleccionado) {
      this.procesarArchivo();
    }
  }

  /// 4️⃣ Procesar el archivo Excel y extraer los datos
  procesarArchivo() {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];  // Obtener el nombre de la primera hoja
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir el contenido de la hoja en un array de objetos con los nombres de las columnas como claves
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Obtener los nombres de las columnas (primer fila)
      const headers = data[0] as string[];
  
      // Extraer los datos comenzando desde la segunda fila (índice 1)
      this.planillaDatos = data.slice(1).map((row: any) => {
        let rowData: any = {};
        
        // Asignamos los valores de la fila a las claves correspondientes de los encabezados
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index];
        });
  
        return rowData;
      });
  
      console.log('Datos procesados:', this.planillaDatos); // Verifica los datos
    };
  
    if (this.archivoSeleccionado) {
      reader.readAsBinaryString(this.archivoSeleccionado);
    }
  }

  // Función para obtener el total del importe (suma de la columna 'Haber Básico')
obtenerTotalImporte(): number {
  // Sumar los valores de 'Haber Básico' de todos los trabajadores
  return this.planillaDatos.reduce((total, trabajador) => {
  return total + parseFloat(trabajador['Haber Básico'] || '0'); // Asegurarse de que el valor sea un número
  }, 0);
}

// Función para contar los trabajadores basados en la columna 'Nro.'
contarTrabajadores(): number {
  // Contamos las filas que contienen un valor válido en la columna 'Nro.'
  return this.planillaDatos.filter(trabajador => trabajador['Nro.'] !== undefined && trabajador['Nro.'] !== '').length;
}


  


// 5️⃣ Declarar la planilla y enviar al servidor
declararPlanilla() {
  // Validación de datos incompletos
  if (!this.archivoSeleccionado || !this.mesSeleccionado || !this.gestionSeleccionada) {
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Datos incompletos',
      text: 'Debe seleccionar un archivo, mes y gestión antes de subir la planilla.',
      confirmButtonText: 'Ok',
      customClass: {
        container: 'swal2-container', // Aplica el estilo al contenedor
      },
      willOpen: () => {
        document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 9999 !important;');
      }
    });
    return;
  }

  // Cerrar modal antes de mostrar la alerta de confirmación
  this.mostrarModal = false;

  // Alerta de confirmación de subida de planilla
  Swal.fire({
    title: '¿Usted desea declarar esta planilla?',
    text: `${this.archivoSeleccionado.name} - ${this.mesSeleccionado} ${this.gestionSeleccionada}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, Declarar',
    cancelButtonText: 'Cancelar',
    customClass: {
      container: 'swal2-container', // Aplica el estilo al contenedor
    },
    willOpen: () => {
      document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 9999 !important;');
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Llamada al servicio para subir la planilla
      this.planillasService.subirPlanilla(
        this.archivoSeleccionado!,
        this.numPatronal ? this.numPatronal.slice(3) : '',
        this.mesSeleccionado,  // Cambia el orden aquí
        this.nomEmpresa ? this.nomEmpresa : '',
        this.gestionSeleccionada!.toString(),  // Cambia el orden aquí
        
        
      ).subscribe({
        next: (response) => {
          // Alerta de éxito al subir la planilla
          Swal.fire({
            icon: 'success',
            title: '✅ Planilla subida',
            text: 'La planilla ha sido subida y procesada correctamente.',
            confirmButtonText: 'Ok',
            customClass: {
              container: 'swal2-container', // Aplica el estilo al contenedor
            },
            willOpen: () => {
              document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 9999 !important;');
            }
          });
          console.log('✅ Respuesta del servidor:', response);
         // Después de subir la planilla exitosamente, vuelve a obtener las planillas actualizadas
          this.obtenerPlanillas(this.numPatronal!.slice(3));

          // Limpiar los datos y cerrar el modal
          this.cancelarSubida();
        },
        error: (err) => {
          console.error('❌ Error al subir planilla:', err);

          // 🛑 Si el error es por planilla duplicada
          if (err.error.message.includes('Ya existe una planilla')) {
            Swal.fire({
              icon: 'error',
              title: '❌ Planilla Duplicada',
              text: 'Ya existe una planilla para este mes y gestión.',
              confirmButtonText: 'Ok',
              customClass: {
                container: 'swal2-container', // Aplica el estilo al contenedor
              },
              willOpen: () => {
                document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 9999 !important;');
              }
              
            });
          } else {
            // Error general
            Swal.fire({
              icon: 'error',
              title: '❌ Error',
              text: 'Hubo un problema al subir la planilla. Inténtalo nuevamente.',
              confirmButtonText: 'Ok',
              customClass: {
                container: 'swal2-container', // Aplica el estilo al contenedor
              },
              willOpen: () => {
                document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 9999 !important;');
              }
            });
          }
        this.cancelarSubida();
        }
      });
    }
  });
}

  
  

// 6️⃣ Limpiar y cancelar la subida
cancelarSubida() {
  // Resetear los valores a sus estados iniciales
  this.mostrarModal = false;
  this.archivoSeleccionado = null;
  this.mesSeleccionado = '';
  this.gestionSeleccionada = null;
  this.planillaDatos = []; 

  // Opcional: Reiniciar el paso del Stepper al primer paso
  this.activeIndex = 0;
}





}
