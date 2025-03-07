import { Component } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalService } from '../../../servicios/local/local.service';
import { EmpresaService } from '../../../servicios/empresa/empresa.service';

import * as XLSX from 'xlsx';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-planillas-aportes-list',
  templateUrl: './planillas-aportes-list.component.html',
  styleUrl: './planillas-aportes-list.component.css',
})
export class PlanillasAportesListComponent {
  planillas: any[] = [];
  loading = true;
  empresa: any = null;
  mostrarModal = false;
  activeIndex: number = 0; // Paso actual en el Stepper
  archivoSeleccionado: File | null = null;
  mesSeleccionado: string = '';
  gestiones: { label: string; value: number }[] = []; // Gestiones disponibles para seleccionar en modal stepper
  gestionSeleccionada: number | null = null;
  planillaDatos: any[] = []; // Datos extraídos de la planilla Excel para el modal steper
  numPatronal: string | null = null;
  nomEmpresa: string | null = null;

  totalRegistros: number = 0;
  pagina: number = 0;
  limite: number = 15;
  busqueda: string = '';

  mesFiltro: string = '';
  anioFiltro: string = '';

  meses = [
    { label: 'ENERO', value: '1' },
    { label: 'FEBRERO', value: '2' },
    { label: 'MARZO', value: '3' },
    { label: 'ABRIL', value: '4' },
    { label: 'MAYO', value: '5' },
    { label: 'JUNIO', value: '6' },
    { label: 'JULIO', value: '7' },
    { label: 'AGOSTO', value: '8' },
    { label: 'SEPTIEMBRE', value: '9' },
    { label: 'OCTUBRE', value: '10' },
    { label: 'NOVIEMBRE', value: '11' },
    { label: 'DICIEMBRE', value: '12' },
  ];

  anios: { label: string; value: string }[] = [];

  steps = [
    { label: 'Elegir Mes y Gestión' },
    { label: 'Importar Planilla' },
    { label: 'Verificar Datos' },
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
    this.generarAnios();
  }

  // Generar el arreglo de gestiones
  generarGestiones() {
    const currentYear = new Date().getFullYear();
    // Crear los tres años: el actual, el anterior y el siguiente
    this.gestiones = [
      { label: (currentYear - 1).toString(), value: currentYear - 1 },
      { label: currentYear.toString(), value: currentYear },
      { label: (currentYear + 1).toString(), value: currentYear + 1 },
    ];
  }

  obtenerNumeroPatronal() {
    try {
      const usuarioRestriccion = JSON.parse(
        this.localService.getLocalStorage('usuarioRestriccion') || '{}'
      );
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


  procesarFecha(fechaPlanilla: string) {
    const fecha = new Date(fechaPlanilla);
    const meses = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];
    return {
      mes: meses[fecha.getUTCMonth()], 
      gestion: fecha.getUTCFullYear(), 
    };
  }

  obtenerPlanillas(cod_patronal: string) {
    if (this.pagina >= 0 && this.limite > 0) {
      this.loading = true;
      this.planillasService
        .getPlanillas(
          cod_patronal,
          this.pagina + 1,
          this.limite,
          this.busqueda,
          this.mesFiltro,
          this.anioFiltro
        )
        .subscribe(
          (response) => {
            this.planillas = response.planillas.map((planilla: any) => ({
              ...planilla,
              mes: this.procesarFecha(planilla.fecha_planilla).mes,
              gestion: this.procesarFecha(planilla.fecha_planilla).gestion,
            }));
            this.totalRegistros = response.total;
            this.loading = false;
            console.log('📡 Planillas de aportes:', this.planillas);
          },
          (error) => {
            console.error('❌ Error al cargar las planillas:', error);
            this.loading = false;
          }
        );
    } else {
      console.error(
        '❌ Número de página o límite inválido:',
        this.pagina,
        this.limite
      );
    }
  }

  onLazyLoad(event: LazyLoadEvent) {
    // Si `event.first` o `event.rows` están undefined, usa valores por defecto
    const first = event.first ?? 0;
    const rows = event.rows ?? this.limite;

    // Actualiza los parámetros de paginación
    this.pagina = Math.floor(first / rows) + 1;
    this.limite = rows;

    // Recarga los pacientes con los nuevos parámetros
    this.obtenerPlanillas(this.numPatronal ? this.numPatronal.slice(3) : '');
  }

  onPageChange(event: any) {
    this.pagina = Math.floor(event.first / event.rows);
    this.limite = event.rows;
    this.obtenerPlanillas(this.numPatronal ? this.numPatronal.slice(3) : '');
  }

  buscar(value: string): void {
    this.busqueda = value.trim();
    this.obtenerPlanillas(this.numPatronal ? this.numPatronal.slice(3) : '');
  }

  // Recargar todo
  recargar() {
    this.busqueda = '';
    this.mesFiltro = '';
    this.anioFiltro = '';
    this.pagina = 0;
    this.obtenerPlanillas(this.numPatronal ? this.numPatronal.slice(3) : '');
  }

  // Generar lista de años (puedes ajustarla según tus necesidades)
  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.anios = [
      {
        label: (currentYear - 1).toString(),
        value: (currentYear - 1).toString(),
      },
      { label: currentYear.toString(), value: currentYear.toString() },
      {
        label: (currentYear + 1).toString(),
        value: (currentYear + 1).toString(),
      },
    ];
  }

  // Aplicar filtros cuando cambian mes o año
  aplicarFiltros() {
    this.pagina = 0; // Resetear a la primera página
    this.obtenerPlanillas(this.numPatronal ? this.numPatronal.slice(3) : '');
  }

  obtenerDatosEmpresa(numPatronal: string) {
    console.log(`🔍 Buscando empresa con número patronal: ${numPatronal}`);

    this.empresaService.getEmpresaByNroPatronal(numPatronal).subscribe(
      (response) => {
        console.log('📡 Respuesta de la API:', response);

        if (response && response.length > 0) {
          this.empresa = response[0];
          console.log('🏢 Empresa asignada:', this.empresa);
        } else {
          console.warn(
            '⚠️ No se encontró información para este número patronal.'
          );
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
      const sheetName = workbook.SheetNames[0]; // Obtener el nombre de la primera hoja
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

  // Función para obtener el total del importe
obtenerTotalImporte(): number {
  return this.planillaDatos.reduce((total, trabajador) => {
    
    const sumaFila = 
      parseFloat(trabajador['Haber Básico'] || '0') +
      parseFloat(trabajador['Bono de antigüedad'] || '0') +
      parseFloat(trabajador['Monto horas extra'] || '0') +
      parseFloat(trabajador['Monto horas extra nocturnas'] || '0') +
      parseFloat(trabajador['Otros bonos y pagos'] || '0');
    

    return total + sumaFila;
  }, 0);
}

  // Función para contar los trabajadores basados en la columna 'Nro.'
  contarTrabajadores(): number {
    // Contamos las filas que contienen un valor válido en la columna 'Nro.'
    return this.planillaDatos.filter(
      (trabajador) =>
        trabajador['Nro.'] !== undefined && trabajador['Nro.'] !== ''
    ).length;
  }

  // 5️⃣ Declarar la planilla y enviar al servidor
  declararPlanilla() {
    // Validación de datos incompletos
    if (
      !this.archivoSeleccionado ||
      !this.mesSeleccionado ||
      !this.gestionSeleccionada
    ) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Datos incompletos',
        text: 'Debe seleccionar un archivo, mes y gestión antes de subir la planilla.',
        confirmButtonText: 'Ok',
        customClass: {
          container: 'swal2-container', // Aplica el estilo al contenedor
        },
        willOpen: () => {
          document
            .querySelector('.swal2-container')
            ?.setAttribute('style', 'z-index: 9999 !important;');
        },
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
        document
          .querySelector('.swal2-container')
          ?.setAttribute('style', 'z-index: 9999 !important;');
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamada al servicio para subir la planilla
        this.planillasService
          .subirPlanilla(
            this.archivoSeleccionado!,
            this.numPatronal ? this.numPatronal.slice(3) : '',
            this.mesSeleccionado, // Cambia el orden aquí
            this.nomEmpresa ? this.nomEmpresa : '',
            this.gestionSeleccionada!.toString() // Cambia el orden aquí
          )
          .subscribe({
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
                  document
                    .querySelector('.swal2-container')
                    ?.setAttribute('style', 'z-index: 9999 !important;');
                },
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
                    document
                      .querySelector('.swal2-container')
                      ?.setAttribute('style', 'z-index: 9999 !important;');
                  },
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
                    document
                      .querySelector('.swal2-container')
                      ?.setAttribute('style', 'z-index: 9999 !important;');
                  },
                });
              }
              this.cancelarSubida();
            },
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
