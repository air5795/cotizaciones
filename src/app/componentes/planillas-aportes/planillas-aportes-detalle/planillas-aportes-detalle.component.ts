import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-planillas-aportes-detalle',
  templateUrl: './planillas-aportes-detalle.component.html',
  styleUrls: ['./planillas-aportes-detalle.component.css']
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

  

  constructor(private route: ActivatedRoute, private planillasService: PlanillasAportesService) {}

  ngOnInit(): void {
    this.idPlanilla = Number(this.route.snapshot.paramMap.get('id'));
    this.obtenerDetalles();
    this.obtenerInformacionPlanilla(); 
  }

// Función para seleccionar el archivo
seleccionarArchivo(event: any) {
  this.archivoSeleccionado = event.target.files[0];
}

// Función para cerrar el modal
cerrarModalImportar() {
  this.mostrarModalImportar = false;
  this.archivoSeleccionado = null;
}


// Función para importar la planilla
importarNuevaPlanilla() {
  if (!this.archivoSeleccionado) {
      Swal.fire({ icon: 'warning', title: 'Seleccione un archivo', text: 'Debe seleccionar un archivo antes de importar.' });
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
      trabajadores = trabajadores.filter(row => 
          Object.values(row).some(value => value !== undefined && value !== null && value !== '')
      );

      console.log("Registros después de filtrar:", trabajadores.length);

      // Enviar los datos al backend
      this.planillasService.actualizarDetallesPlanilla(this.idPlanilla, trabajadores).subscribe({
          next: () => {
              Swal.fire({ icon: 'success', title: 'Planilla actualizada', text: 'Los detalles han sido actualizados correctamente.' });
              this.cerrarModalImportar();
              this.obtenerDetalles();
          },
          error: (err) => {
              console.error('Error al actualizar detalles:', err);
              Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al actualizar los detalles.' });
          }
      });
  };

  reader.readAsBinaryString(this.archivoSeleccionado);
}









  obtenerInformacionPlanilla() {
    this.planillasService.getPlanillaId(this.idPlanilla).subscribe({
      next: (data) => {
        this.planillaInfo = data; 
        console.log('Información de la planilla:', this.planillaInfo);
      },
      error: (err) => {
        console.error('Error al obtener información de la planilla:', err);
      }
    });
  }

  

  obtenerDetalles() {
    this.planillasService.getPlanillaDetalle(this.idPlanilla).subscribe({
        next: (data) => {
            this.trabajadores = data.trabajadores || []; // Asegúrate de que siempre sea un arreglo
            this.loading = false;
        },
        error: (err) => {
            console.error('Error al obtener detalles:', err);
            this.loading = false;
        }
    });
}

  getFondoEstado(estado: number): string {
    switch (estado) {
      case 3:
        return 'rgb(219, 119, 119)'; // Rojo claro para "Planilla Observada"
      case 2:
        return 'rgb(119, 219, 119)'; // Verde claro para "Planilla Aprobada"
      default:
        return '#77bcdb'; // azul claro para "En Espera de Aprobación"
    }
  }

  editarTrabajador(trabajador: any) {
    this.trabajadorSeleccionado = { ...trabajador };
    this.displayModal = true;
  }

  guardarEdicion() {
    const index = this.trabajadores.findIndex(t => t.nro === this.trabajadorSeleccionado.nro);
    if (index !== -1) {
      this.trabajadores[index] = { ...this.trabajadorSeleccionado };
    }
    this.displayModal = false;

  }

  guardarYEnviar() {
    for (let trabajador of this.trabajadores) {
      /* if (!trabajador.ci || !trabajador.apellido_paterno || !trabajador.nombres || 
          !trabajador.cargo || !trabajador.salario || !trabajador.fecha_ingreso || !trabajador.regional) { */
          if (!trabajador.ci ) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Vacíos',
          text: 'Hay trabajadores con campos vacíos. Verifica antes de enviar.',
          confirmButtonText: 'Ok'
        });
        return;
      }

      if (trabajador.salario <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Salario Inválido',
          text: `El salario de ${trabajador.nombres} debe ser mayor a 0.`,
          confirmButtonText: 'Ok'
        });
        return;
      }
    }

    Swal.fire({
      title: '¿Confirmar envío?',
      text: "¿Estás seguro de que deseas enviar la planilla corregida?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.planillasService.enviarCorreccionPlanilla(this.idPlanilla, this.trabajadores).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Planilla enviada',
              text: 'La planilla corregida se ha enviado con éxito.',
              confirmButtonText: 'Ok'
            });
          },
          error: (err) => {
            console.error('Error al enviar planilla corregida:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error al enviar',
              text: 'Hubo un problema al enviar la planilla. Inténtalo de nuevo.',
              confirmButtonText: 'Ok'
            });
          }
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
        confirmButtonText: 'Ok'
      });
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.trabajadores);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Planilla_${this.idPlanilla}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exportación Exitosa',
      text: 'La planilla ha sido exportada a Excel.',
      confirmButtonText: 'Ok'
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
        cancelButtonText: 'Cancelar'
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
          });
          // Vaciar la lista de trabajadores manualmente
          this.trabajadores = [];
          this.loading = false; // Asegúrate de que el loading se desactive
      },
      error: (err) => {
          console.error('Error al eliminar detalles:', err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al eliminar los detalles.' });
          this.loading = false; // Asegúrate de que el loading se desactive en caso de error
      }
  });
}


declararPlanilla() {
  Swal.fire({
      title: '¿Declarar la planilla nuevamente?',
      text: 'Esto enviará la planilla para revisión.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, declarar',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
      if (result.isConfirmed) {
          this.planillasService.actualizarEstadoPlanilla(this.idPlanilla, 1).subscribe({
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
                  Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo declarar la planilla.' });
              }
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
          confirmButtonText: 'Ok'
        });
        return;
      }
    
      this.planillasService.generarReporteResumen(this.idPlanilla).subscribe({
        next: (data: Blob) => {
          const fileURL = URL.createObjectURL(data);
          const ventanaEmergente = window.open("", "VistaPreviaPDF", "width=900,height=600,scrollbars=no,resizable=no");
    
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
              confirmButtonText: 'Ok'
            });
          }
        },
        error: (err) => {
          console.error('Error al generar el reporte resumen:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el reporte resumen.',
            confirmButtonText: 'Ok'
          });
        }
      });
    }

}