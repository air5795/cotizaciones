import {Component, AfterViewInit, Renderer2, OnInit, OnDestroy} from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AppComponent} from './app.component';

@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html'
})
export class AppMainComponent implements AfterViewInit, OnDestroy {

    activeTabIndex: number | undefined;

    sidebarActive: boolean | undefined;

    topbarMenuActive: boolean | undefined;

    sidebarClick: boolean | undefined;

    topbarItemClick: boolean | undefined;

    activeTopbarItem: any;

    documentClickListener: any;

    configActive: boolean | undefined;

    configClick: boolean | undefined;

    constructor(public renderer: Renderer2, private primengConfig: PrimeNGConfig, public app: AppComponent) {}

    ngAfterViewInit() {
        this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.sidebarClick && (this.overlay || !this.isDesktop())) {
                this.sidebarActive = false;
            }

            if (this.configActive && !this.configClick) {
                this.configActive = false;
            }

            this.configClick = false;
            this.topbarItemClick = false;
            this.sidebarClick = false;
        });
    }

    onTabClick(event: Event, index: number) {
        if (this.activeTabIndex === index) {
            this.sidebarActive = !this.sidebarActive;
        } else {
            this.activeTabIndex = index;
            this.sidebarActive = true;
        }

        event.preventDefault();
    }

    closeSidebar(event: Event) {
        this.sidebarActive = false;
        event.preventDefault();
    }

    onSidebarClick($event: any) {
        this.sidebarClick = true;
    }

    onTopbarMenuButtonClick(event: any) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;

        event.preventDefault();
    }

    onTopbarItemClick(event: any, item: any) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null; } else {
            this.activeTopbarItem = item; }

        event.preventDefault();
    }

    onTopbarSubItemClick(event: any) {
      console.log(event);
        event.preventDefault();
    }

    onConfigClick(event: any) {
        this.configClick = true;
    }

    onRippleChange(event: any) {
        this.app.ripple = event.checked;
        this.primengConfig = event.checked;
    }

    get overlay(): boolean {
        return this.app.layoutMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
}
