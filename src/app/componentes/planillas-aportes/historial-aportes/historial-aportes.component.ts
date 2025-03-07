import { Component } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-historial-aportes',
  templateUrl: './historial-aportes.component.html',
  styleUrls: ['./historial-aportes.component.css']
})
export class HistorialAportesComponent {

  planillas: any[] = [];
  totalRegistros: number = 0;
  pagina: number = 0;
  limite: number = 15;
  busqueda: string = '';

  constructor(private planillasService: PlanillasAportesService , private router: Router,) {}

  ngOnInit(): void {
    this.cargarPlanillas();
  }

  cargarPlanillas(): void {
    if (this.pagina >= 0 && this.pagina !== undefined && this.limite > 0) {
      this.planillasService.getPlanillasTodoHistorial(this.pagina + 1, this.limite, this.busqueda).subscribe(
        (response) => {
          this.planillas = response.planillas;
          this.totalRegistros = response.total; 
        },
        (error) => {
          console.error('Error al cargar las planillas', error);
        }
      );
    } else {
      console.error('El número de página o límite es inválido:', this.pagina, this.limite);
    }
  }

  onLazyLoad(event: LazyLoadEvent) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.limite;
    this.pagina = Math.floor(first / rows) + 1;
    this.limite = rows;
    this.cargarPlanillas();
  }

  onPageChange(event: any) {
    this.pagina = Math.floor(event.first / event.rows) ;
    this.limite = event.rows;
    this.cargarPlanillas();
  }

  buscar(value: string): void {
    this.busqueda = value.trim();
    this.cargarPlanillas();
  }

  recargar() {
    this.busqueda = ''; 
    this.pagina = 0; 
    console.log('Búsqueda después de recargar:', this.busqueda);  
    this.cargarPlanillas(); 
  }
  

  verPlanilla(id_planilla: number) {
    this.router.navigate(['/cotizaciones/aprobar-planillas-aportes', id_planilla]);
  }

}
