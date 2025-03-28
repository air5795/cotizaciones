import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {MenuService} from './app.menu.service';
import {AppMainComponent} from './app.main.component';


@Component({
    selector: '[app-menuitem]',
    template: `
      <ng-container>
        <a [attr.href]="item.url" (click)="itemClick($event)" *ngIf="(!item.routerLink || item.items) && item.visible !== false" (keydown.enter)="itemClick($event)"
           [attr.target]="item.target" [attr.tabindex]="0" pRipple (mouseenter)="hover=true" (mouseleave)="hover=false" [ngClass]="item.class">
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span>{{item.label}}</span>
          <span class="ink" *ngIf="hover"></span>
          <span class="menuitem-badge" *ngIf="item.badge">{{item.badge}}</span>
          <i class="pi pi-fw pi-angle-down submenu-toggler" *ngIf="item.items"></i>
        </a>
        <a (click)="itemClick($event)" (mouseenter)="hover=true" (mouseleave)="hover=false" *ngIf="(item.routerLink && !item.items) && item.visible !== false"
           [ngClass]="item.class" [routerLink]="item.routerLink" routerLinkActive="active-menuitem-routerlink" pRipple
           [routerLinkActiveOptions]="{exact: !item.preventExact}" [attr.target]="item.target" [attr.tabindex]="0">
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span>{{item.label}}</span>
          <span class="ink" *ngIf="hover"></span>
          <span class="menuitem-badge" *ngIf="item.badge">{{item.badge}}</span>
          <i class="pi pi-fw pi-angle-down submenu-toggler" *ngIf="item.items"></i>
        </a>
        <ul *ngIf="(item.items && (active || item.active)) && item.visible !== false" [@children]="(active || item.active ? 'visibleAnimated' : 'hiddenAnimated')">
          <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
            <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
          </ng-template>
        </ul>
      </ng-container>
    `,
    host: {
      '[class.active-menuitem]': 'active'
    },
    animations: [
      trigger('children', [
        state('void', style({
          height: '0px'
        })),
        state('hiddenAnimated', style({
          height: '0px'
        })),
        state('visibleAnimated', style({
          height: '*'
        })),
        transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
        transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
        transition('void => visibleAnimated, visibleAnimated => void',
          animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
      ])
    ]
  })
  export class AppMenuitemComponent implements OnInit, OnDestroy {
  
    @Input() item: any;
  
    @Input() index: number | undefined;
  
    @Input() root: boolean | undefined;
  
    @Input() parentKey: string | undefined;
  
    hover: boolean | undefined;
  
    active = false;
  
    menuSourceSubscription: Subscription;
  
    menuResetSubscription: Subscription;
  
    key: string | undefined;
  
    constructor(public appMain: AppMainComponent, public router: Router, private cd: ChangeDetectorRef, private menuService: MenuService) {
      this.menuSourceSubscription = this.menuService.menuSource$.subscribe(key => {
        // deactivate current active menu
        if (this.active && this.key !== key && key.indexOf(this.key!) !== 0) {
          this.active = false;
        }
      });
  
      this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
        this.active = false;
      });
  
      this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(params => {
          if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
          } else {
            this.active = false;
          }
        });
    }
  
    ngOnInit() {
      this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
    }
  
    updateActiveStateFromRoute() {
      this.active = this.router.isActive(this.item.routerLink[0], !this.item.items && !this.item.preventExact);
      if (this.item.items) {
        this.item.active = this.item.items.some((child: any) => child.active);
      }
    }
  
    itemClick(event: Event) {
      // avoid processing disabled items
      if (this.item.disabled) {
        event.preventDefault();
        return;
      }
  
      // notify other items
      this.menuService.onMenuStateChange(this.key!);
  
      // execute command
      if (this.item.command) {
        this.item.command({ originalEvent: event, item: this.item });
      }
  
      // toggle active state
      if (this.item.items) {
        this.active = !this.active; // Cambia el estado de expansión/colapso
      } else {
        // activate item
        this.active = true;
  
        // hide overlay menus
        if (this.appMain.overlay || !this.appMain.isDesktop()) {
          this.appMain.sidebarActive = false;
        }
      }
    }
  
    ngOnDestroy() {
      if (this.menuSourceSubscription) {
        this.menuSourceSubscription.unsubscribe();
      }
  
      if (this.menuResetSubscription) {
        this.menuResetSubscription.unsubscribe();
      }
    }
  }