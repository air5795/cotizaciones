// src/app/components/liquidaciones-aportes/liquidaciones-aportes.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { MessageService, Message } from 'primeng/api';

@Component({
  selector: 'app-liquidaciones-aportes',
  templateUrl: './liquidaciones-aportes.component.html',
  styleUrls: ['./liquidaciones-aportes.component.scss'],
  providers: [MessageService],
})
export class LiquidacionesAportesComponent implements OnInit {
  @Input() idPlanilla!: number;
  planilla: any = null;
  loading: boolean = false;
  errorMessage: string | undefined = undefined;
  messages: Message[] = []; // Propiedad pública para manejar mensajes

  constructor(
    private planillasService: PlanillasAportesService,
    private messageService: MessageService // Mantener como private
  ) {}

  ngOnInit() {
    this.loadAportes();
  }

  // Cargar aportes automáticamente
  loadAportes() {
    if (!this.idPlanilla) {
      this.errorMessage = 'Por favor, asegúrate de que el ID de la planilla esté definido.';
      this.messages = [{ severity: 'error', summary: 'Error', detail: this.errorMessage }];
      return;
    }

    this.loading = true;
    this.errorMessage = undefined;
    this.messages = []; // Limpiar mensajes previos
    this.planillasService.calcularAportes(this.idPlanilla).subscribe({
      next: (response: any) => {
        this.planilla = response.planilla;
        this.messages = [{ severity: 'success', summary: 'Éxito', detail: response.mensaje }];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al calcular los aportes';
        this.messages = [{ severity: 'error', summary: 'Error', detail: this.errorMessage }];
        this.loading = false;
      },
    });
  }
}