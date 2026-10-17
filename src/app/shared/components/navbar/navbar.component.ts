import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4" *ngIf="authService.isAuthenticated()">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/reservar">
          <i class="bi bi-building-check me-2"></i>Controle de Espaços
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <!-- Solicitar Reserva: Exclusivo para perfis que podem abrir pedidos (USUARIO e ADMINISTRADOR) -->
            <li class="nav-item" *ngIf="authService.hasRole('USUARIO') || authService.hasRole('ADMINISTRADOR')">
              <a class="nav-link" routerLink="/reservar" routerLinkActive="active">
                <i class="bi bi-calendar-plus me-1"></i>Solicitar Reserva
              </a>
            </li>

            <!-- Fila de Moderação: Exclusivo para moderadores (COLABORADOR e ADMINISTRADOR) -->
            <li class="nav-item" *ngIf="authService.hasRole('COLABORADOR') || authService.hasRole('ADMINISTRADOR')">
              <a class="nav-link" routerLink="/gestao-solicitacoes" routerLinkActive="active">
                <i class="bi bi-card-checklist me-1"></i>Aprovações & Uso
              </a>
            </li>

            <!-- Relatórios Oficiais: Acesso comum a todos os perfis autenticados -->
            <li class="nav-item">
              <a class="nav-link" routerLink="/relatorios" routerLinkActive="active">
                <i class="bi bi-file-earmark-bar-graph me-1"></i>Relatórios
              </a>
            </li>

            <!-- Gestão Estrutural: Exclusivo para ADMINISTRADOR -->
            <li class="nav-item" *ngIf="authService.hasRole('ADMINISTRADOR')">
              <a class="nav-link" routerLink="/cadastros" routerLinkActive="active">
                <i class="bi bi-diagram-3 me-1"></i>Estrutura & Cadastros
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-center text-white">
            <span class="badge bg-light text-primary me-3 p-2">
              <i class="bi bi-person-circle me-1"></i>{{ authService.getUserLogin() }}
            </span>

            <!-- Botão de Alteração de Senha -->
            <button type="button" class="btn btn-outline-light btn-sm me-2" (click)="abrirModalSenha()" title="Alterar minha senha">
              <i class="bi bi-key-fill me-1"></i>Senha
            </button>

            <button class="btn btn-outline-light btn-sm" (click)="authService.logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Modal de Alteração de Senha -->
    <div *ngIf="exibirModalSenha" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div *ngIf="exibirModalSenha" class="modal d-block" tabindex="-1" style="z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0 text-dark">
          <div class="modal-header bg-light">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-shield-lock text-primary me-2"></i>Alterar Minha Senha
            </h6>
            <button type="button" class="btn-close" (click)="fecharModalSenha()"></button>
          </div>

          <div class="modal-body text-start">
            <div *ngIf="alertaModal" class="alert small py-2 mb-3" [ngClass]="sucessoModal ? 'alert-success' : 'alert-danger'">
              {{ alertaModal }}
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Senha Atual</label>
              <input type="password" class="form-control" [(ngModel)]="formSenha.senhaAtual" placeholder="Digite a senha atual">
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Nova Senha</label>
              <input type="password" class="form-control" [(ngModel)]="formSenha.novaSenha" placeholder="Mínimo de 6 caracteres">
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold">Confirmar Nova Senha</label>
              <input type="password" class="form-control" [(ngModel)]="formSenha.confirmarSenha" placeholder="Repita a nova senha">
            </div>
          </div>

          <div class="modal-footer bg-light py-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="fecharModalSenha()" [disabled]="loadingSenha">
              Cancelar
            </button>
            <button type="button" class="btn btn-sm btn-primary" (click)="confirmarAlteracaoSenha()" [disabled]="loadingSenha">
              <span *ngIf="loadingSenha" class="spinner-border spinner-border-sm me-1"></span>
              Salvar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  private http = inject(HttpClient);

  exibirModalSenha = false;
  loadingSenha = false;
  alertaModal = '';
  sucessoModal = false;

  formSenha = {
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  };

  abrirModalSenha(): void {
    this.formSenha = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };
    this.alertaModal = '';
    this.sucessoModal = false;
    this.exibirModalSenha = true;
  }

  fecharModalSenha(): void {
    this.exibirModalSenha = false;
  }

  confirmarAlteracaoSenha(): void {
    if (!this.formSenha.senhaAtual || !this.formSenha.novaSenha) {
      this.alertaModal = 'Preencha todos os campos.';
      this.sucessoModal = false;
      return;
    }

    if (this.formSenha.novaSenha.length < 6) {
      this.alertaModal = 'A nova senha deve ter pelo menos 6 caracteres.';
      this.sucessoModal = false;
      return;
    }

    if (this.formSenha.novaSenha !== this.formSenha.confirmarSenha) {
      this.alertaModal = 'A confirmação não coincide com a nova senha.';
      this.sucessoModal = false;
      return;
    }

    this.loadingSenha = true;
    this.alertaModal = '';

    const payload = {
      senhaAtual: this.formSenha.senhaAtual,
      novaSenha: this.formSenha.novaSenha
    };

    this.http.patch('http://localhost:8080/api/usuarios/alterar-senha', payload).subscribe({
      next: () => {
        this.loadingSenha = false;
        this.sucessoModal = true;
        this.alertaModal = 'Senha alterada com sucesso!';
        setTimeout(() => this.fecharModalSenha(), 1800);
      },
      error: (err) => {
        this.loadingSenha = false;
        this.sucessoModal = false;
        this.alertaModal = err?.error?.message || err?.error?.mensagem || 'Erro ao alterar a senha. Verifique a senha atual informada.';
      }
    });
  }
}
