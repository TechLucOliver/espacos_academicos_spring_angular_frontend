import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SolicitarReservaComponent } from './pages/solicitar-reserva/solicitar-reserva.component';
import { GestaoSolicitacoesComponent } from './pages/gestao-solicitacoes/gestao-solicitacoes.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
// Se o ficheiro estiver na pasta app/cadastros:
import { CadastrosComponent } from './cadastros/cadastros.component';
// (Caso tenha colocado dentro de pages, use: './pages/cadastros/cadastros.component')
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Apenas Docentes/Usuários e Administradores solicitam reserva
  {
    path: 'reservar',
    component: SolicitarReservaComponent,
    canActivate: [authGuard],
    data: { roles: ['USUARIO', 'ADMINISTRADOR'] }
  },

  // Apenas Coordenadores (Colaboradores) e Administradores aprovam
  {
    path: 'gestao-solicitacoes',
    component: GestaoSolicitacoesComponent,
    canActivate: [authGuard],
    data: { roles: ['COLABORADOR', 'ADMINISTRADOR'] }
  },

  // Todos os perfis autenticados têm acesso a relatórios (com filtros internos)
  {
    path: 'relatorios',
    component: RelatoriosComponent,
    canActivate: [authGuard],
    data: { roles: ['USUARIO', 'COLABORADOR', 'ADMINISTRADOR'] }
  },

  // Apenas Administradores gerenciam a estrutura acadêmica e cadastros
  {
    path: 'cadastros',
    component: CadastrosComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },

  { path: '**', redirectTo: 'login' }
];
