import {Component, OnInit} from '@angular/core';
import { LocalService } from './servicios/local/local.service';
import { Recurso } from './dominio/Recurso';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  template: `
    <div class="menu-scroll-content">
      <ul class="navigation-menu">
        <li
          app-menuitem
          *ngFor="let item of model; let i = index"
          [item]="item"
          [index]="i"
          [root]="true"
        ></li>
      </ul>
    </div>
  `,
})
export class AppMenuComponent implements OnInit {
  public model: any[] | undefined;

  constructor(private localService: LocalService, private router: Router) {}

  ngOnInit() {
    this.model = this.mapear(JSON.parse(this.localService.getLocalStorage("recursos")!));

    // Escuchar cambios en la ruta para actualizar el estado activo
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveState(this.model!);
    });
  }

  mapear(recurso: Recurso[]): any {
    if (recurso.length == 0) {
      return null;
    } else {
      return recurso.map((r: Recurso) => {
        return {
          label: r.nombreRecurso,
          icon: 'pi pi-'+r.icono,
          routerLink: r.uri === 'null' ? null : r.uri,
          badgeStyleClass: 'teal-badge',
          items: this.mapear(r.listaDeRecurso),
          active: false // Inicialmente, ningún elemento está activo
        };
      });
    }
  }

  updateActiveState(items: any[]) {
    items.forEach(item => {
      item.active = this.router.isActive(item.routerLink, true);
      if (item.items) {
        this.updateActiveState(item.items);
        // Si algún hijo está activo, el padre también debe estar activo
        item.active = item.items.some((child: any) => child.active);
      }
    });
  }
}
