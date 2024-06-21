import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "bienvenida",
        pathMatch: "full"
    },
    {
        path: "bienvenida", 
        loadComponent: () => import('./componentes/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)
    },
    {
        path: "login",
        loadComponent: () => import('./componentes/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: "registro",
        loadComponent: () => import('./componentes/registro/registro.component').then(m => m.RegistroComponent)
    }
];
