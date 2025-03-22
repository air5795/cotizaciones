// src/app/components/pagos-aportes/pagos-aportes.component.ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableLazyLoadEvent } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { PagoAporte } from '../../../models/pago-aporte.model';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagos-aportes',
  templateUrl: './pagos-aportes.component.html',
  styleUrls: ['./pagos-aportes.component.css'],
  providers: [MessageService],
})
export class PagosAportesComponent implements OnInit {
  @Input() idPlanilla!: number;
  @ViewChild('createPagoDialog') createPagoDialog!: Dialog;
  @ViewChild('imageDialog') imageDialog!: Dialog;

  pagoForm: FormGroup;
  pagos: PagoAporte[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  limite: number = 10;
  selectedFile: File | null = null;
  displayDialog: boolean = false;
  displayImageDialog: boolean = false;
  selectedImageUrl: string = '';
  isPdfLoaded: boolean = true;
  calculoDetalles: any = null;
  calculating: boolean = false;

  constructor(
    private planillasAportesService: PlanillasAportesService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.pagoForm = this.fb.group({
      id_planilla_aportes: ['', Validators.required],
      fecha_pago: ['', Validators.required],
      monto_pagado: ['', [
        Validators.required,
        Validators.min(0),
        (control: AbstractControl) => {
          if (this.calculoDetalles && control.value < this.calculoDetalles.total_a_cancelar) {
            return { montoInsuficiente: true };
          }
          return null;
        }
      ]],
      metodo_pago: [''],
      comprobante_pago: [''],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    if (this.idPlanilla) {
      this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla });
      this.loadPagos({ first: 0, rows: this.limite } as TableLazyLoadEvent);
    }
  }

  // Cargar pagos con paginación lazy
  loadPagos(event: TableLazyLoadEvent): void {
    if (!this.idPlanilla) {
      console.error('No se proporcionó un idPlanilla válido');
      this.loading = false;
      return;
    }

    this.loading = true;
    const first = event.first || 0;
    const rows = event.rows || this.limite;

    this.planillasAportesService.findByIdPlanilla(this.idPlanilla).subscribe(
      (data) => {
        this.pagos = data.slice(first, first + rows);
        this.totalRecords = data.length;
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar pagos:', error);
        this.loading = false;
      }
    );
  }

  // Calcular el total a cancelar al hacer clic en el botón
  calcularTotalACancelar(): void {
    const fechaPago = this.pagoForm.get('fecha_pago')?.value;
    console.log('Fecha seleccionada en el formulario:', fechaPago);
  
    if (!fechaPago) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, selecciona una fecha de pago.',
      });
      return;
    }
  
    let fechaPagoDate: Date;
    if (fechaPago.length === 16) {
      // Formato de datetime-local: "2025-03-20T17:03"
      fechaPagoDate = new Date(`${fechaPago}:00.000Z`);
    } else {
      fechaPagoDate = new Date(fechaPago);
    }
    console.log('Fecha convertida a Date:', fechaPagoDate);
  
    if (isNaN(fechaPagoDate.getTime())) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fecha de pago inválida.',
      });
      return;
    }
  
    const fechaPagoIso = fechaPagoDate.toISOString();
    console.log('Fecha en formato ISO para enviar al backend:', fechaPagoIso);
  
    this.calculating = true; // Mostrar loading
    this.planillasAportesService
      .calcularAportesPreliminar(this.idPlanilla, fechaPagoIso)
      .subscribe(
        (detalles) => {
          // Redondear total_a_cancelar a 2 decimales
          detalles.total_a_cancelar = Math.round(detalles.total_a_cancelar * 100) / 100;
  
          this.calculoDetalles = detalles;
          this.pagoForm.patchValue({ monto_pagado: detalles.total_a_cancelar }); // Asignar total_a_cancelar a monto_pagado
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cálculo preliminar realizado con éxito.',
          });
          this.calculating = false; // Ocultar loading
        },
        (error) => {
          console.error('Error al calcular el total a cancelar:', error);
          this.calculoDetalles = null;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo calcular el total a cancelar. Por favor, intenta de nuevo.',
          });
          this.calculating = false; // Ocultar loading
        }
      );
  }

  // Crear un nuevo pago
  onSubmit(): void {
    if (this.pagoForm.valid && this.selectedFile && this.calculoDetalles) {
      const pagoData = this.pagoForm.getRawValue();
      this.planillasAportesService.createPago(pagoData, this.selectedFile).subscribe(
        (response) => {
          console.log('Pago creado:', response);
          this.loadPagos({ first: 0, rows: this.limite } as TableLazyLoadEvent);
          this.displayDialog = false;
          this.pagoForm.reset();
          this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla });
          this.selectedFile = null;
          this.calculoDetalles = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago creado con éxito.',
          });
          this.router.navigate(['cotizaciones/planillas-aportes']);
        },
        (error) => {
          console.error('Error al crear pago:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el pago. Por favor, intenta de nuevo.',
          });
        }
      );
    }
  }

  // Manejar la selección del archivo
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  // Abrir el modal para crear pago
  openCreatePagoDialog(): void {
    this.pagoForm.reset();
    this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla });
    this.selectedFile = null;
    this.calculoDetalles = null;
    this.displayDialog = true;
  }

  // Limpiar el formulario al cerrar el modal
  onDialogHide(): void {
    this.pagoForm.reset();
    this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla });
    this.selectedFile = null;
    this.calculoDetalles = null;
  }

  // Abrir el modal para ver la imagen
  openImageDialog(pago: PagoAporte): void {
    this.selectedImageUrl = `http://localhost:4000/${pago.foto_comprobante}`;
    this.isPdfLoaded = true;
    this.displayImageDialog = true;
  }

  // Manejar errores del iframe
  onIframeError(event: Event): void {
    console.error('Error al cargar el PDF:', event);
    this.isPdfLoaded = false;
  }

  formatFecha(fecha: string): string {
    return fecha.split('.')[0];
  }
}