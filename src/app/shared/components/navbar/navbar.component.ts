import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4" *ngIf="authService.isAuthenticated()">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/reservas">
          <i class="bi bi-building-check me-2"></i>Controle de Espaços
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/reservar" routerLinkActive="active">
                <i class="bi bi-calendar-plus me-1"></i>Solicitar Reserva
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.hasRole('COLABORADOR') || authService.hasRole('ADMINISTRADOR')">
              <a class="nav-link" routerLink="/gestao-solicitacoes" routerLinkActive="active">
                <i class="bi bi-card-checklist me-1"></i>Aprovações & Uso
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/relatorios" routerLinkActive="active">
                <i class="bi bi-file-earmark-bar-graph me-1"></i>Relatórios
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.hasRole('ADMINISTRADOR')">
              <a class="nav-link" routerLink="/cadastros" routerLinkActive="active">
                <i class="bi bi-diagram-3 me-1"></i> Estrutura & Cadastros
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center text-white">
            <span class="badge bg-light text-primary me-3 p-2">
              <i class="bi bi-person-circle me-1"></i>{{ authService.getUserLogin() }}
            </span>
            <button class="btn btn-outline-light btn-sm" (click)="authService.logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
}
