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
  mesFiltro: string = '';
  anioFiltro: string = '';
  estadoFiltro: number | undefined;

  loading = true;
  anios: { label: string; value: string }[] = [];
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
  estados = [
    { label: 'PLANILLAS PRESENTADAS', value: 1 },
    { label: 'PLANILLAS APROBADAS', value: 2 },
  ];

  constructor(private planillasService: PlanillasAportesService , private router: Router,) {}

  ngOnInit(): void {
    this.obtenerPlanillas();
    this.generarAnios();
  }

  obtenerPlanillas() {
    if (this.pagina >= 0 && this.limite > 0) {
      this.loading = true;
      this.planillasService
        .obtenerHistorialAdmin(
          this.pagina + 1,
          this.limite,
          this.busqueda,
          this.mesFiltro,
          this.anioFiltro,
          this.estadoFiltro
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
    this.obtenerPlanillas();
  }

  onPageChange(event: any) {
    this.pagina = Math.floor(event.first / event.rows);
    this.limite = event.rows;
    this.obtenerPlanillas();
  }

  buscar(value: string): void {
    this.busqueda = value.trim();
    this.obtenerPlanillas();
  }

  // Recargar todo
  recargar() {
    this.busqueda = '';
    this.mesFiltro = '';
    this.estadoFiltro = undefined;
    this.anioFiltro = '';
    this.pagina = 0;
    this.obtenerPlanillas();
    
  }

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

  procesarEstado() {
    const estado = [
      'BORRADOR',
      'PRESENTADO',
      'APROBADO',
    ];
    return {
      estado: estado, 
    };
  }

  aplicarFiltros() {
    console.log('Estado Filtro:', this.estadoFiltro); // Verifica el valor
    this.pagina = 0; // Resetear a la primera página
    this.obtenerPlanillas();
  }
  

  verPlanilla(id_planilla: number) {
    this.router.navigate(['/cotizaciones/aprobar-planillas-aportes', id_planilla]);
  }

}
