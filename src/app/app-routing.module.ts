import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardDemoComponent } from './componentes/inicio/dashboarddemo.component';
import { AppMainComponent } from './app.main.component';
import { AppErrorComponent } from './componentes/error/app.error.component';
import { AppLoginComponent } from './componentes/login/app.login.component';
import { AutentificacionComponent } from './componentes/autentificacion/autentificacion.component';
import { AppAccessdeniedComponent } from './componentes/denegado/app.accessdenied.component';
import { SistemaComponent } from './componentes/sistema/sistema.component';
import { ClasificadorComponent } from './componentes/clasificador/clasificador.component';
import { RecursoComponent } from './componentes/recurso/recurso.component';
import { UsuarioComponent } from './componentes/usuario/usuario.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { RestriccionComponent } from './componentes/usuario/restriccion/restriccion.component';
import { PlanillaIncapacidadComponent } from './componentes/empresa/planilla-incapacidad/planilla-incapacidad.component';
import { PlanillaAportesComponent } from './componentes/empresa/planilla-aportes/planilla-aportes.component';
import { PlanillaAportesAprobarComponent } from './componentes/empresa/planilla-aportes/planilla-aportes-aprobar.component';
import { DatosEmpresaComponent } from './componentes/datos-empresa/datos-empresa.component';
import { PlanillasAportesListComponent } from './componentes/planillas-aportes/planillas-aportes-list/planillas-aportes-list.component';
import { PlanillasAportesDetalleComponent } from './componentes/planillas-aportes/planillas-aportes-detalle/planillas-aportes-detalle.component';
import { PlanillasAportesAprobarComponent } from './componentes/planillas-aportes/planillas-aportes-aprobar/planillas-aportes-aprobar.component';
import { PlanillasAportesDetalleAprobarComponent } from './componentes/planillas-aportes/planillas-aportes-detalle-aprobar/planillas-aportes-detalle-aprobar.component';
import { HistorialAportesComponent } from './componentes/planillas-aportes/historial-aportes/historial-aportes.component';
@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: 'cotizaciones', component: AppMainComponent,
                children: [
                    { path: '', component: DatosEmpresaComponent },
                    // DATOS DE PERFIL DE EMPRESA ---------------------------------------------------------
                    { path: 'datos-empresa', component: DatosEmpresaComponent },
                    // PLANILLAS DE APORTES -------------------------------------------------------------
                    { path: 'planillas-aportes', component: PlanillasAportesListComponent },
                    { path: 'planillas-aportes/:id', component: PlanillasAportesDetalleComponent },
                    { path: 'aprobar-planillas-aportes', component: PlanillasAportesAprobarComponent },
                    { path: 'aprobar-planillas-aportes/:id', component: PlanillasAportesDetalleAprobarComponent },
                    { path: 'historial-aportes', component: HistorialAportesComponent },
                    // OTROS -----------------------------------------------------------------------------
                    { path: 'sistemas', component: SistemaComponent },
                    { path: 'clasificadores', component: ClasificadorComponent },
                    { path: 'planillas-incapacidad', component: PlanillaIncapacidadComponent },
                    { path: 'planilla-aprobar', component: PlanillaAportesAprobarComponent },
                    { path: 'lista-personal', component: UsuarioComponent },
                    { path: 'perfiles', component: PerfilComponent },
                    { path: 'restriccionesUsuario/:id', component: RestriccionComponent }, 
                ]
            },
            { path: 'error', component: AppErrorComponent },
            { path: '', component: AppLoginComponent },
            { path: 'autentificar', component: AutentificacionComponent },
            { path: 'denegado', component: AppAccessdeniedComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

