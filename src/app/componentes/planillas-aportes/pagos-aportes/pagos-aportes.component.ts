// src/app/components/pagos-aportes/pagos-aportes.component.ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PlanillasAportesService } from '../../../servicios/planillas-aportes/planillas-aportes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableLazyLoadEvent } from 'primeng/table'; 
import { Dialog } from 'primeng/dialog';
import { PagoAporte } from '../../../models/pago-aporte.model';

@Component({
  selector: 'app-pagos-aportes',
  templateUrl: './pagos-aportes.component.html',
  styleUrls: ['./pagos-aportes.component.css']
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

  constructor(
    private planillasAportesService: PlanillasAportesService,
    private fb: FormBuilder
  ) {
    this.pagoForm = this.fb.group({
      id_planilla_aportes: ['', Validators.required],
      fecha_pago: ['', Validators.required],
      monto_pagado: ['', [Validators.required, Validators.min(0)]],
      metodo_pago: [''],
      comprobante_pago: [''],
      observaciones: ['']
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

// Crear un nuevo pago
onSubmit(): void {
  if (this.pagoForm.valid && this.selectedFile) {
    const pagoData = this.pagoForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados
    this.planillasAportesService.createPago(pagoData, this.selectedFile).subscribe(
      (response) => {
        console.log('Pago creado:', response);
        this.loadPagos({ first: 0, rows: this.limite } as TableLazyLoadEvent); // Recargar la lista
        this.displayDialog = false; // Cerrar el modal
        this.pagoForm.reset();
        this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla }); // Restablecer idPlanilla después del reset
        this.selectedFile = null;
      },
      (error) => {
        console.error('Error al crear pago:', error);
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
    this.pagoForm.patchValue({ id_planilla_aportes: this.idPlanilla }); // Establecer idPlanilla al abrir el modal
    this.selectedFile = null;
    this.displayDialog = true; // Mostrar el modal
  }

  // Abrir el modal para ver la imagen
  openImageDialog(pago: PagoAporte): void {
    this.selectedImageUrl = `http://localhost:4000/${pago.foto_comprobante}`;
    this.isPdfLoaded = true; // Reiniciar el estado al abrir el modal
    this.displayImageDialog = true;
  }

  // Manejar errores del iframe
  onIframeError(event: Event): void {
    console.error('Error al cargar el PDF:', event);
    this.isPdfLoaded = false; // Marcar que el PDF no se cargó
  }

}