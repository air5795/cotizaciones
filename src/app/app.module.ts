import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';


// PrimeNG Components for demos
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';

// Application Components
import { AppCodeModule } from './blocks/app-code/app.code.component';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppSideBarComponent } from './app.sidebar.component';
import { AppSidebartabcontentComponent } from './app.sidebartabcontent.component';
import { AppConfigComponent } from './app.config.component';
import { AppTopbarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppErrorComponent } from './componentes/error/app.error.component';
import { AppLoginComponent } from './componentes/login/app.login.component';
import { BlockViewer } from './blocks/blockviewer/blockviewer.component';
// Demo pages
import { DashboardDemoComponent } from './componentes/inicio/dashboarddemo.component';
// Demo services
import { CountryService } from './servicios/countryservice';
import { CustomerService } from './servicios/customerservice';
import { EventService } from './servicios/eventservice';
import { IconService } from './servicios/iconservice';
import { NodeService } from './servicios/nodeservice';
import { PhotoService } from './servicios/photoservice';
import { ProductService } from './servicios/productservice';
import { MenuService } from './app.menu.service';
import { AutentificacionComponent } from './componentes/autentificacion/autentificacion.component';
import { SistemaComponent } from './componentes/sistema/sistema.component';
import { ClasificadorComponent } from './componentes/clasificador/clasificador.component';
import { RecursoComponent } from './componentes/recurso/recurso.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { UsuarioComponent } from './componentes/usuario/usuario.component';
import { StepperModule } from 'primeng/stepper';
import { RestriccionComponent } from './componentes/usuario/restriccion/restriccion.component';
import { PlanillaIncapacidadComponent } from './componentes/empresa/planilla-incapacidad/planilla-incapacidad.component';
import { PlanillaAportesComponent } from './componentes/empresa/planilla-aportes/planilla-aportes.component';
import { PlanillaAportesAprobarComponent } from './componentes/empresa/planilla-aportes/planilla-aportes-aprobar.component';
import { DatosEmpresaComponent } from './componentes/datos-empresa/datos-empresa.component';
import { MessageService } from 'primeng/api';
import { PlanillasAportesComponent } from './componentes/planillas-aportes/planillas-aportes.component';
import { PlanillasAportesListComponent } from './componentes/planillas-aportes/planillas-aportes-list/planillas-aportes-list.component';
import { PlanillasAportesDetalleComponent } from './componentes/planillas-aportes/planillas-aportes-detalle/planillas-aportes-detalle.component';
import { PlanillasAportesAprobarComponent } from './componentes/planillas-aportes/planillas-aportes-aprobar/planillas-aportes-aprobar.component';
import { PlanillasAportesDetalleAprobarComponent } from './componentes/planillas-aportes/planillas-aportes-detalle-aprobar/planillas-aportes-detalle-aprobar.component';
import { HistorialAportesComponent } from './componentes/planillas-aportes/historial-aportes/historial-aportes.component';
import { PlanillasAdicionalesComponent } from './componentes/planillas-aportes/planillas-adicionales/planillas-adicionales.component';
import { PagosAportesComponent } from './componentes/planillas-aportes/pagos-aportes/pagos-aportes.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AccordionModule,
    AutoCompleteModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    BreadcrumbModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CarouselModule,
    CascadeSelectModule,
    ChartModule,
    CheckboxModule,
    ChipModule,
    ChipsModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ColorPickerModule,
    ContextMenuModule,
    DataViewModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    FieldsetModule,
    FileUploadModule,
    GalleriaModule,
    ImageModule,
    InplaceModule,
    InputNumberModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    KnobModule,
    ListboxModule,
    MegaMenuModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MessagesModule,
    MultiSelectModule,
    OrderListModule,
    OrganizationChartModule,
    OverlayPanelModule,
    PaginatorModule,
    PanelModule,
    PanelMenuModule,
    PasswordModule,
    PickListModule,
    ProgressBarModule,
    RadioButtonModule,
    RatingModule,
    RippleModule,
    ScrollPanelModule,
    ScrollTopModule,
    SelectButtonModule,
    SidebarModule,
    SkeletonModule,
    SlideMenuModule,
    SliderModule,
    SplitButtonModule,
    SplitterModule,
    StepsModule,
    StepperModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    TagModule,
    TerminalModule,
    TimelineModule,
    TieredMenuModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeTableModule,
    VirtualScrollerModule,
    AppCodeModule,
  ],
  declarations: [
    AppComponent,
    AppMainComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    AppConfigComponent,
    AppTopbarComponent,
    AppFooterComponent,
    AppSideBarComponent,
    AppSidebartabcontentComponent,
    AppErrorComponent,
    AppLoginComponent,
    DashboardDemoComponent,
    AppLoginComponent,
    AppErrorComponent,
    BlockViewer,
    AutentificacionComponent,
    SistemaComponent,
    ClasificadorComponent,
    RecursoComponent,
    PerfilComponent,
    UsuarioComponent,
    RestriccionComponent,
    PlanillaIncapacidadComponent,
    PlanillaAportesComponent,
    PlanillaAportesAprobarComponent,
    DatosEmpresaComponent,
    PlanillasAportesComponent,
    PlanillasAportesListComponent,
    PlanillasAportesDetalleComponent,
    PlanillasAportesAprobarComponent,
    PlanillasAportesDetalleAprobarComponent,
    HistorialAportesComponent,
    PlanillasAdicionalesComponent,
    PagosAportesComponent,
    SafeUrlPipe,
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, CountryService, CustomerService, EventService, IconService, NodeService,
    PhotoService, ProductService, MenuService , MessageService , { provide: LOCALE_ID, useValue: 'es' } ],
  bootstrap: [AppComponent],
})
export class AppModule { }
