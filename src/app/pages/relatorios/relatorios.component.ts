import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white fw-bold py-3">
        <i class="bi bi-file-earmark-text me-1 text-primary"></i>Central de Emissão de Relatórios Oficiais
      </div>
      <div class="card-body">
        <div class="d-flex gap-2 flex-wrap mb-4">
          <button class="btn btn-outline-primary" *ngIf="auth.hasRole('ADMINISTRADOR')" (click)="carregarRelatorio('estrutural')">
            <i class="bi bi-diagram-3 me-1"></i>Estrutural (IES, CAs e Cursos)
          </button>
          <button class="btn btn-outline-primary" *ngIf="auth.hasRole('ADMINISTRADOR')" (click)="carregarRelatorio('docentes')">
            <i class="bi bi-people me-1"></i>Corpo Docente & CAs
          </button>
          <button class="btn btn-outline-success" (click)="carregarRelatorio('espacos-solicitacoes')">
            <i class="bi bi-clock-history me-1"></i>Espaços & Movimentação
          </button>
        </div>

        <div *ngIf="relatorioData" class="border rounded p-4 bg-white shadow-sm">
          <div class="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="fw-bold mb-1 text-uppercase text-primary">Relatório Oficial Gerado</h5>
              <span class="text-muted small">
                Emissor: <strong>{{ relatorioData.emissor?.nome }}</strong> | Matrícula/Login: {{ relatorioData.emissor?.identificacao }}
              </span>
            </div>
            <span class="badge bg-secondary p-2">
              Emitido em: {{ relatorioData.emissor?.dataHoraEmissao | date:'dd/MM/yyyy HH:mm:ss' }}
            </span>
          </div>

          <!-- JSON Formatado / Tabela Simplificada -->
          <pre class="bg-light p-3 rounded border small" style="max-height: 450px; overflow-y: auto;">{{ relatorioData | json }}</pre>
        </div>
      </div>
    </div>
  `
})
export class RelatoriosComponent {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  relatorioData: any = null;

  carregarRelatorio(tipo: string) {
    this.http.get(`http://localhost:8080/api/relatorios/${tipo}`).subscribe({
      next: (data) => this.relatorioData = data,
      error: (err) => alert(err.error?.mensagem || 'Acesso negado para o seu perfil.')
    });
  }
}
