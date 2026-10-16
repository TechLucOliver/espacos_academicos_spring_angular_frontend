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
  { path: 'reservar', component: SolicitarReservaComponent, canActivate: [authGuard] },
  { path: 'gestao-solicitacoes', component: GestaoSolicitacoesComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'cadastros', component: CadastrosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
