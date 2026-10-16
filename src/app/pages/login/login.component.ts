import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <i class="bi bi-mortarboard-fill text-primary" style="font-size: 3rem;"></i>
              <h4 class="fw-bold mt-2">Acesso ao Sistema</h4>
              <p class="text-muted small">Controle de Espaços Acadêmicos (UCSAL)</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger py-2 small">
              {{ errorMessage }}
            </div>

            <form (ngSubmit)="entrar()">
              <div class="mb-3">
                <label class="form-label small fw-semibold">E-mail ou Matrícula</label>
                <input type="text" class="form-control" [(ngModel)]="login" name="login" required placeholder="ex: admin@ucsal.br">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Senha</label>
                <input type="password" class="form-control" [(ngModel)]="senha" name="senha" required placeholder="••••••••">
              </div>
              <button type="submit" class="btn btn-primary w-100 fw-semibold" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Autenticar
              </button>
            </form>

            <hr class="my-4">
            <div class="text-center">
              <span class="text-muted small d-block mb-2">Preenchimento rápido para teste:</span>
              <div class="btn-group btn-group-sm w-100">
                <button type="button" class="btn btn-outline-secondary" (click)="preencher('admin@ucsal.br', 'admin123')">Admin</button>
                <button type="button" class="btn btn-outline-secondary" (click)="preencher('carlos.docente@ucsal.br', 'docente123')">Docente Carlos</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  login = '';
  senha = '';
  loading = false;
  errorMessage = '';

  preencher(l: string, s: string) {
    this.login = l;
    this.senha = s;
  }

  entrar() {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login({ login: this.login, senha: this.senha }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/reservar']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.mensagem || 'Falha no login. Verifique as credenciais.';
      }
    });
  }
}
