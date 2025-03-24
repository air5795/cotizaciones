import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { PagoAporte } from '../../../models/pago-aporte.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos-aportes-admin',
  templateUrl: './pagos-aportes-admin.component.html',
  styleUrls: ['./pagos-aportes-admin.component.css']
})
export class PagosAportesAdminComponent implements OnInit {
  @ViewChild('tablaPlanillasAportes') tablaPlanillasAportes!: Table;

  pagos: PagoAporte[] = [];
  loading: boolean = true;

  displayDialog: boolean = false;
  displayImageDialog: boolean = false;
  selectedImageUrl: string = '';
  isPdfLoaded: boolean = true;

  // Propiedades para el modal del reporte de historial
  displayHistorialDialog: boolean = false;
  mes: number | null = null;
  gestion: number | null = null;
  meses: { label: string, value: number }[] = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];
  gestiones: number[] = [];

  constructor(private planillasAportesService: PlanillasAportesService) {}

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarGestiones();
  }

  cargarPagos(): void {
    this.loading = true;
    this.planillasAportesService.findAllWithDetails().subscribe({
      next: (response) => {
        this.pagos = response.pagos.map((pago: PagoAporte) => ({
          ...pago,
          mes: pago.fecha_planilla !== 'No disponible'
            ? new Date(pago.fecha_planilla).toLocaleString('es', { month: 'long' })
            : 'N/A',
          gestion: pago.fecha_planilla !== 'No disponible'
            ? new Date(pago.fecha_planilla).getFullYear().toString()
            : 'N/A',
        }));
        console.log('Pagos cargados:', this.pagos);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar los pagos:', error);
        this.loading = false;
      }
    });
  }

  cargarGestiones(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 5; year++) {
      this.gestiones.push(year);
    }
  }

  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.tablaPlanillasAportes.filterGlobal(inputElement.value, 'contains');
  }

  openImageDialog(pago: PagoAporte): void {
    this.selectedImageUrl = `http://10.0.0.152:4000/${pago.foto_comprobante}`;
    this.isPdfLoaded = true;
    this.displayImageDialog = true;
  }

  onIframeError(event: Event): void {
    console.error('Error al cargar el PDF:', event);
    this.isPdfLoaded = false;
  }

  Recibo(idPlanilla: number): void {
    if (!idPlanilla) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay datos',
        text: 'No se ha proporcionado el ID de la planilla.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    this.planillasAportesService.generarReportePagoAporte(idPlanilla).subscribe({
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
                <title>Vista Previa del Recibo</title>
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
        console.error('Error al generar el recibo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el recibo.',
          confirmButtonText: 'Ok',
        });
      }
    });
  }

  // Mostrar el modal para el reporte de historial
  showHistorialDialog(): void {
    this.mes = null;
    this.gestion = null;
    this.displayHistorialDialog = true;
  }

  // Generar el reporte de historial
  generarReporteHistorial(): void {
    if (!this.mes || !this.gestion) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, seleccione el mes y el año.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    this.planillasAportesService.generarReporteHistorial(this.mes, this.gestion).subscribe({
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
                <title>Vista Previa del Reporte de Historial</title>
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
          this.displayHistorialDialog = false;
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
        console.error('Error al generar el reporte de historial:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte de historial.',
          confirmButtonText: 'Ok',
        });
      }
    });
  }
}