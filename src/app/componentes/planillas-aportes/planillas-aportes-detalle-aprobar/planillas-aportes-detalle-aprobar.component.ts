import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-planillas-aportes-detalle-aprobar',
  templateUrl: './planillas-aportes-detalle-aprobar.component.html',
  styleUrl: './planillas-aportes-detalle-aprobar.component.css'
})
export class PlanillasAportesDetalleAprobarComponent {

    idPlanilla!: number;
    trabajadores: any[] = [];
    loading = true;
    displayModal = false;
    trabajadorSeleccionado: any = {};
    planillaInfo: any = {};

    estadoSeleccionado!: number;
    observaciones!: string;
    items: MenuItem[];

    
  
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

    estados = [
      { label: 'Aprobado', value: 2 },
      { label: 'Observado', value: 3 }
    ];

    altas: any[] = [];
    bajas: any[] = [];

    displayPdfModal: boolean = false; // Controla la visibilidad del modal
    pdfSrc: string = ''; // URL del PDF para mostrar en el iframe
  
    
  
    constructor(
      private route: ActivatedRoute, 
      private planillasService: PlanillasAportesService,
      private router: Router) {
      this.items = [
        {
          label: 'RESUMEN',
          icon: 'pi pi-file-pdf',
          command: () => {
            this.exportarPdfrResumen();
          }
        },
        {
          label: 'BAJAS DETECTADAS',
          icon: 'pi pi-file-pdf',
          command: () => {
            this.exportarPdf();
          }
        },
        {
          label: 'PLANILLA DECLARADA',
          icon: 'pi pi-file-excel',
          command: () => {
            this.exportarExcel();
          }
        }
      ];
    }
  
    ngOnInit(): void {
      this.idPlanilla = Number(this.route.snapshot.paramMap.get('id'));
      this.obtenerDetalles();
      this.obtenerInformacionPlanilla(); 
    }

    obtenerMesAnterior(mesActual: string): string | null {
      const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
      const index = meses.indexOf(mesActual.toUpperCase());
    
      console.log(`Mes actual recibido: ${mesActual}`);
      console.log(`Índice del mes en la lista: ${index}`);
    
      // Si el mes es enero, devolver diciembre, en caso contrario, devolver el mes anterior
      const mesAnterior = index > 0 ? meses[index - 1] : "DICIEMBRE";
      console.log(`Mes anterior calculado: ${mesAnterior}`);
    
      return mesAnterior;
    }
    
    

    obtenerComparacionPlanillas() {
      if (!this.planillaInfo.planilla) return;
    
      const { cod_patronal, gestion, mes } = this.planillaInfo.planilla;
      console.log(`Datos obtenidos: cod_patronal=${cod_patronal}, gestion=${gestion}, mes=${mes}`);
    
      const mesAnterior = this.obtenerMesAnterior(mes);
    
      if (!mesAnterior) {
        console.warn("El mes anterior no fue calculado correctamente.");
        return;
      }
    
      console.log(`Llamando a compararPlanillas con mesAnterior=${mesAnterior}, mesActual=${mes}`);
    
      this.planillasService.compararPlanillas(cod_patronal, gestion, mesAnterior, mes).subscribe({
        next: (data) => {
          console.log("Respuesta del backend:", data);
          this.altas = data.altas;
          this.bajas = data.bajas;
        },
        error: (err) => {
          console.error("Error al comparar planillas:", err);
        }
      });
    }
    
  
    obtenerInformacionPlanilla() {
      this.planillasService.getPlanillaId(this.idPlanilla).subscribe({
        next: (data) => {
          this.planillaInfo = data; 
          this.obtenerComparacionPlanillas();
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
          this.trabajadores = data.trabajadores;
          this.loading = false;
          console.log('Detalles de la planilla:', this.trabajadores);
        },
        error: (err) => {
          console.error('Error al obtener detalles:', err);
          this.loading = false;
        }
      });
    }

    mostrarModal() {
      this.displayModal = true;
    }


    guardarEstado() {
      this.planillasService.actualizarEstadoPlanilla(this.idPlanilla, this.estadoSeleccionado, this.observaciones).subscribe({
        next: (response) => {
          this.displayModal = false; // Cierra el modal antes de mostrar la alerta
          setTimeout(() => { // Espera a que se cierre antes de mostrar la alerta
            Swal.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: response.mensaje,
              confirmButtonText: 'Ok',
              customClass: {
                popup: 'swal2-custom-zindex' // Clase personalizada
              }
            }).then(() => {
              this.router.navigate(['cotizaciones/aprobar-planillas-aportes']);
              
            });
          }, 100); // Pequeño delay para evitar solapamientos
        },
        error: (err) => {
          this.displayModal = false;
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado de la planilla',
              confirmButtonText: 'Ok',
              customClass: {
                popup: 'swal2-custom-zindex'
              }
            });
          }, 100);
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

    exportarPdf() {
      if (!this.planillaInfo.planilla) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay datos',
          text: 'No se ha cargado la información de la planilla.',
          confirmButtonText: 'Ok'
        });
        return;
      }
    
      const { cod_patronal, gestion, mes } = this.planillaInfo.planilla;
      const mesAnterior = this.obtenerMesAnterior(mes);
    
      if (!mesAnterior) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay mes anterior',
          text: 'No se puede generar el reporte de bajas sin un mes anterior.',
          confirmButtonText: 'Ok'
        });
        return;
      }
    
      this.planillasService.generarReporteBajas(this.idPlanilla, cod_patronal, mesAnterior, mes, gestion).subscribe({
        next: (data: Blob) => {
          // Crear una URL con el Blob del PDF
          const fileURL = URL.createObjectURL(data);
    
          // Configurar la ventana emergente
          const ventanaEmergente = window.open("", "VistaPreviaPDF", "width=900,height=600,scrollbars=no,resizable=no");
    
          if (ventanaEmergente) {
            // Escribir el contenido HTML dentro de la ventana emergente
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
          console.error('Error al generar el reporte de bajas:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el reporte de bajas.',
            confirmButtonText: 'Ok'
          });
        }
      });
    }
    
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
