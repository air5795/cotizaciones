import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

    mostrarModal() {
      this.displayModal = true;
    }


    guardarEstado() {
    this.planillasService.actualizarEstadoPlanilla(this.idPlanilla, this.estadoSeleccionado, this.observaciones).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: response.mensaje,
          confirmButtonText: 'Ok'
        });
        this.displayModal = false;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado de la planilla',
          confirmButtonText: 'Ok'
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
