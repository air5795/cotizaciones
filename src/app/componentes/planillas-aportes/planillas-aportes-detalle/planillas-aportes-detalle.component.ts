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
        this.trabajadores = data.trabajadores;
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
      if (!trabajador.ci || !trabajador.apellido_paterno || !trabajador.nombres || 
          !trabajador.cargo || !trabajador.salario || !trabajador.fecha_ingreso || !trabajador.regional) {
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
}