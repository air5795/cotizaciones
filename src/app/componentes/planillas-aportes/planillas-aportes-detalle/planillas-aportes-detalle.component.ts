import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-planillas-aportes-detalle',
  templateUrl: './planillas-aportes-detalle.component.html',
  styleUrls: ['./planillas-aportes-detalle.component.css'],
})
export class PlanillasAportesDetalleComponent implements OnInit {
  idPlanilla!: number;
  trabajadores: any[] = [];
  loading = true;
  displayModal = false;
  trabajadorSeleccionado: any = {};
  planillaInfo: any = {};

  mostrarModalImportacion = false;
  mostrarModalImportar = false;
  archivoSeleccionado: File | null = null;

  pagina: number = 1;
  limite: number = 15;
  total: number = 0;
  busqueda: string = '';

  altas: any[] = [];
  bajasNoEncontradas: any[] = [];
  bajasPorRetiro: any[] = []; 

  resumenData: any = null; // Para almacenar los datos del resumen
  resumenLoading = false; // Indicador de carga para el resumen

  progreso: number = 100;

  regionales = [
    { label: 'LA PAZ', value: 'LA PAZ' },
    { label: 'COCHABAMBA', value: 'COCHABAMBA' },
    { label: 'SANTA CRUZ', value: 'SANTA CRUZ' },
    { label: 'POTOSÍ', value: 'POTOSI' },
    { label: 'ORURO', value: 'ORURO' },
    { label: 'TARIJA', value: 'TARIJA' },
    { label: 'PANDO', value: 'PANDO' },
    { label: 'BENI', value: 'BENI' },
    { label: 'CHUQUISACA', value: 'CHUQUISACA' },
  ];

  
  constructor(
    private route: ActivatedRoute,
    private planillasService: PlanillasAportesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idPlanilla = Number(this.route.snapshot.paramMap.get('id'));
    this.obtenerDetalles();
    this.obtenerInformacionPlanilla().then(() => {
      this.obtenerComparacionPlanillas();
      this.obtenerResumenPlanilla(); 
    });
  }

  // Función para seleccionar el archivo
  seleccionarArchivo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      // Simula una carga completa
      this.progreso = 100;
    }
  }

  // Función para cerrar el modal
  cerrarModalImportar() {
    this.mostrarModalImportar = false;
    this.archivoSeleccionado = null;
    this.progreso = 0;
  }

  // Función para importar la planilla
  importarNuevaPlanilla() {
    if (!this.archivoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un archivo',
        text: 'Debe seleccionar un archivo antes de importar.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = data[0] as string[];
      let trabajadores = data.slice(1).map((row: any) => {
        let rowData: any = {};
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      // 🔥 Filtrar filas vacías
      trabajadores = trabajadores.filter((row) =>
        Object.values(row).some(
          (value) => value !== undefined && value !== null && value !== ''
        )
      );

      // Enviar los datos al backend
      this.planillasService
        .actualizarDetallesPlanilla(this.idPlanilla, trabajadores)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Planilla actualizada',
              text: 'Los detalles han sido actualizados correctamente.',
            });
            this.cerrarModalImportar();
            this.obtenerDetalles();
            this.obtenerResumenPlanilla();
            this.obtenerComparacionPlanillas();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al actualizar los detalles.',
            });
          },
        });
    };

    reader.readAsBinaryString(this.archivoSeleccionado);
  }

  obtenerInformacionPlanilla(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.planillasService.getPlanillaId(this.idPlanilla).subscribe({
        next: (data) => {
          this.planillaInfo = data;
          if (this.planillaInfo.planilla && this.planillaInfo.planilla.fecha_planilla) {
            const fecha = new Date(this.planillaInfo.planilla.fecha_planilla);
            const meses = [
              'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
              'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
            ];
            this.planillaInfo.planilla.mes = meses[fecha.getUTCMonth()];
            this.planillaInfo.planilla.gestion = fecha.getUTCFullYear();
          }
          console.log('Información de la planilla:', this.planillaInfo);
          resolve(); 
        },
        error: (err) => {
          console.error('Error al obtener información de la planilla:', err);
          reject(err);
        }
      });
    });
  }

  /* OBTENER DETALLES BUSQUEDA Y PAGINACION *************************************************************************************************** */

  obtenerDetalles() {
    this.loading = true;
    this.planillasService
      .getPlanillaDetalle(
        this.idPlanilla,
        this.pagina,
        this.limite,
        this.busqueda
      )
      .subscribe({
        next: (data) => {
          this.trabajadores = data.trabajadores || [];
          this.total = data.total || 0;
          this.loading = false;
          console.log('Datos recibidos:', data);
          console.log('Página actual:', this.pagina);
          console.log('Límite actual:', this.limite);
          console.log('Total de registros:', this.total);
        },
        error: (err) => {
          console.error('Error al obtener detalles:', err);
          this.loading = false;
        },
      });
  }

  onPageChange(event: any) {
    this.pagina = Math.floor(event.first / event.rows) + 1;
    this.limite = event.rows;
    this.obtenerDetalles();
  }

  buscar(value: string): void {
    this.busqueda = value.trim();
    this.pagina = 1; 
    this.obtenerDetalles();
  }

  recargar() {
    this.busqueda = ''; 
    this.pagina = 1; 
    console.log('Búsqueda después de recargar:', this.busqueda);  
    this.obtenerDetalles(); 
  }

/************************************************************************************************************************************************ */
/* colores de estado *********************************************************************************************************************** */
  getColorEstado(estado: number): string {
    switch (estado) {
      case 3:
        return '#ff4545';
      case 0:
        return '#b769fb';
      case 2:
        return '#059b89';
      default:
        return '#558fbb';
    }
  }

  getFondoEstado(fondo: number): string {
    switch (fondo) {
      case 0:
        return '#ebe6ff';
      case 3:
        return '#ffdfdf';
      case 2:
        return '#edfff6';
      default:
        return '#e5edf9';
    }
  }
/**********************************************************************************************************************************************/ 
/* BAJAS Y ALTAS ******************************************************************************************************************************/


obtenerMesAnterior(fechaActual: string): { mesAnterior: string, gestion: string } | null {
  const [year, month] = fechaActual.split('T')[0].split('-'); 
  const añoActual = parseInt(year); 
  const mesActual = parseInt(month) - 1; 

  let añoAnterior = añoActual;
  let mesAnterior = mesActual - 1; 

  if (mesAnterior < 0) {
    mesAnterior = 11; 
    añoAnterior = añoActual - 1;
  }

  const mesAnteriorStr = String(mesAnterior + 1).padStart(2, '0'); 
  const gestionAnterior = añoAnterior.toString();

  console.log(`Entrada: ${fechaActual}, Mes actual (0-based): ${mesActual}, Mes anterior: ${mesAnteriorStr}, Gestión anterior: ${gestionAnterior}`);

  return { mesAnterior: mesAnteriorStr, gestion: gestionAnterior };
}


obtenerComparacionPlanillas() {
  if (!this.planillaInfo.planilla) return;

  const { cod_patronal, fecha_planilla } = this.planillaInfo.planilla;
  console.log(`Datos obtenidos: cod_patronal=${cod_patronal}, fecha_planilla=${fecha_planilla}`);

  // Extraer gestión y mes actual directamente de fecha_planilla
  const [year, month] = fecha_planilla.split('T')[0].split('-'); 
  const gestion = year; 
  const mesActual = month; 

  // Calcular mes anterior
  const mesAnteriorData = this.obtenerMesAnterior(fecha_planilla);

  if (!mesAnteriorData) {
    console.warn("El mes anterior no fue calculado correctamente.");
    return;
  }

  const { mesAnterior } = mesAnteriorData;

  console.log(`Llamando a compararPlanillas con: 
    cod_patronal=${cod_patronal}, 
    gestion=${gestion}, 
    mesAnterior=${mesAnterior}, 
    mesActual=${mesActual}`);

  this.planillasService.compararPlanillas(cod_patronal, gestion, mesAnterior, mesActual).subscribe({
    next: (data) => {
      console.log("Respuesta del backend:", data);
      this.altas = data.altas;
      this.bajasNoEncontradas = data.bajas.noEncontradas; // Bajas por trabajador no encontrado
      this.bajasPorRetiro = data.bajas.porRetiro; // Bajas por fecha de retiro
    },
    error: (err) => {
      console.error("Error al comparar planillas:", err);
    }
  });
}





/*************************************************************************************************************************************************/
  editarTrabajador(trabajador: any) {
    this.trabajadorSeleccionado = { ...trabajador };
    this.displayModal = true;
  }

  guardarEdicion() {
    const index = this.trabajadores.findIndex(
      (t) => t.nro === this.trabajadorSeleccionado.nro
    );
    if (index !== -1) {
      this.trabajadores[index] = { ...this.trabajadorSeleccionado };
    }
    this.displayModal = false;
    
    this.obtenerResumenPlanilla();
    this.obtenerComparacionPlanillas();
  }

  declararPlanillaBorrador() {
    Swal.fire({
      title: '¿Declarar la Planilla de Aportes?',
      text: 'Esta acción enviará la planilla a revisión.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, declarar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planillasService
          .actualizarEstadoAPendiente(this.idPlanilla)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Planilla enviada',
                text: 'La planilla ha sido declarada como borrador.',
              });
              this.router.navigate(['cotizaciones/planillas-aportes']);
            },
            error: (err) => {
              console.error('Error al actualizar estado:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo declarar la planilla.',
              });
            },
          });
      }
    });
  }

  guardarYEnviar() {

    for (let trabajador of this.trabajadores) {
      /* if (!trabajador.ci || !trabajador.apellido_paterno || !trabajador.nombres || 
          !trabajador.cargo || !trabajador.salario || !trabajador.fecha_ingreso || !trabajador.regional) { */
      if (!trabajador.ci) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Vacíos',
          text: 'Hay trabajadores con campos vacíos. Verifica antes de enviar.',
          confirmButtonText: 'Ok',
        });
        return;
      }

      if (trabajador.salario <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Salario Inválido',
          text: `El salario de ${trabajador.nombres} debe ser mayor a 0.`,
          confirmButtonText: 'Ok',
        });
        return;
      }
    }

    Swal.fire({
      title: '¿Confirmar envío?',
      text: '¿Estás seguro de que deseas enviar la planilla corregida?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planillasService
          .enviarCorreccionPlanilla(this.idPlanilla, this.trabajadores)
          .subscribe({
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Planilla enviada',
                text: 'La planilla corregida se ha enviado con éxito.',
                confirmButtonText: 'Ok',
              });
            },
            error: (err) => {
              console.error('Error al enviar planilla corregida:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: 'Hubo un problema al enviar la planilla. Inténtalo de nuevo.',
                confirmButtonText: 'Ok',
              });
            },
          });
      }
    });
  }

  exportarExcel() {
    if (!this.trabajadores || this.trabajadores.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay datos',
        text: 'No hay trabajadores en la planilla para exportar.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.trabajadores);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla');
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `Planilla_${this.idPlanilla}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exportación Exitosa',
      text: 'La planilla ha sido exportada a Excel.',
      confirmButtonText: 'Ok',
    });
  }

  // eliminar detalles de la planilla --------------------------------------------------------------------------------------

  confirmarEliminacionDetalles() {
    Swal.fire({
      title: '¿Eliminar los detalles de la planilla?',
      text: 'Esta acción no se puede deshacer. ¿Desea continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarDetallesPlanilla();
        
      }
    });
  }

  eliminarDetallesPlanilla() {
    this.planillasService.eliminarDetallesPlanilla(this.idPlanilla).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Detalles eliminados',
          text: 'Los detalles de la planilla han sido eliminados correctamente.',
        }).then((result) => {
          if (result.isConfirmed) {
            
            window.location.reload();
          }
        });
        this.trabajadores = []; 
        this.loading = false; 
      },
      error: (err) => {
        console.error('Error al eliminar detalles:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar los detalles.',
        });
        this.loading = false; 
      },
    });
  }

  declararPlanilla() {
    Swal.fire({
      title: '¿Declarar la planilla nuevamente?',
      text: 'Esto enviará la planilla para revisión.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, declarar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planillasService
          .actualizarEstadoPlanilla(this.idPlanilla, 1)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Planilla enviada',
                text: 'La planilla ha sido declarada nuevamente.',
              });
              this.obtenerDetalles();
            },
            error: (err) => {
              console.error('Error al actualizar estado:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo declarar la planilla.',
              });
            },
          });
      }
    });
  }

  // reporte de resumen de planilla declara -------------------------------------------------------------------------------------------

  exportarPdfrResumen() {
    if (!this.idPlanilla) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay datos',
        text: 'No se ha cargado el ID de la planilla.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    this.planillasService.generarReporteResumen(this.idPlanilla).subscribe({
      next: (data: Blob) => {
        const fileURL = URL.createObjectURL(data);
        const ventanaEmergente = window.open(
          '',
          'VistaPreviaPDF',
          'width=900,height=600,scrollbars=no,resizable=no'
        );

        if (ventanaEmergente) {
          ventanaEmergente.document.write(`
              <html>
                <head>
                  <title>Vista Previa del PDF</title>
                  <style>
                    body { margin: 0; text-align: center; }
                    iframe { width: 100%; height: 100vh; border: none; }
                  </style>
                </head>
                <body>
                  <iframe src="${fileURL}"></iframe>
                </body>
              </html>
            `);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo abrir la vista previa del PDF. Es posible que el navegador haya bloqueado la ventana emergente.',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        console.error('Error al generar el reporte resumen:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte resumen.',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  ReporteDS08() {
    if (!this.idPlanilla) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay datos',
        text: 'No se ha cargado el ID de la planilla.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    this.planillasService.generarReporteDS08(this.idPlanilla).subscribe({
      next: (data: Blob) => {
        const fileURL = URL.createObjectURL(data);
        const ventanaEmergente = window.open(
          '',
          'VistaPreviaPDF',
          'width=900,height=600,scrollbars=no,resizable=no'
        );

        if (ventanaEmergente) {
          ventanaEmergente.document.write(`
              <html>
                <head>
                  <title>Vista Previa del PDF</title>
                  <style>
                    body { margin: 0; text-align: center; }
                    iframe { width: 100%; height: 100vh; border: none; }
                  </style>
                </head>
                <body>
                  <iframe src="${fileURL}"></iframe>
                </body>
              </html>
            `);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo abrir la vista previa del PDF. Es posible que el navegador haya bloqueado la ventana emergente.',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        console.error('Error al generar el reporte resumen:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte resumen.',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  // resumen por regionales ----------------------------------------------------------------------------------------------------

  obtenerResumenPlanilla() {
    this.resumenLoading = true;
    this.planillasService.obtenerDatosPlanillaPorRegional(this.idPlanilla).subscribe({
      next: (response) => {
        if (response.success) {
          this.resumenData = response.data;
          console.log('Datos del resumen:', this.resumenData);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se pudieron obtener los datos del resumen.',
          });
        }
        this.resumenLoading = false;
      }
      });
    }




}