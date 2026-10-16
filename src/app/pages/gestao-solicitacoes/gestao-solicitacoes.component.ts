import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-gestao-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white py-3">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button class="nav-link fw-bold" [class.active]="abaAtiva === 'ESPACOS'" (click)="trocarAba('ESPACOS')">
              <i class="bi bi-door-open me-1 text-primary"></i> Reservas de Espaços
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link fw-bold" [class.active]="abaAtiva === 'SOFTWARES'" (click)="trocarAba('SOFTWARES')">
              <i class="bi bi-cpu me-1 text-primary"></i> Moderação de Softwares (RF 8)
            </button>
          </li>
        </ul>
      </div>

      <div *ngIf="alerta" class="alert m-3 py-2 small" [ngClass]="alertaSucesso ? 'alert-success' : 'alert-danger'">
        {{ alerta }}
      </div>

      <!-- ================= ABA 1: RESERVAS DE ESPAÇOS ================= -->
      <div *ngIf="abaAtiva === 'ESPACOS'" class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small">
              <tr>
                <th>ID</th><th>Espaço</th><th>Solicitante</th><th>Data & Horário</th><th>Status</th><th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of solicitacoesEspacos">
                <td>#{{ s.id }}</td>
                <td class="fw-semibold">{{ s.espacoNome || s.espaco?.nome }}</td>
                <td>
                  {{ s.solicitanteNome || s.solicitante?.nomeCompleto }}
                  <span *ngIf="isMinhaSolicitacao(s)" class="badge bg-secondary-subtle text-secondary border ms-1">Você</span>
                </td>
                <td>{{ s.dataUtilizacao }} ({{ s.horaInicio }} às {{ s.horaFim }})</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': s.status === 'PENDENTE',
                    'bg-success': s.status === 'APROVADA',
                    'bg-danger': s.status === 'REPROVADA',
                    'bg-info': s.status === 'FINALIZADA'
                  }">{{ s.status }}</span>
                </td>
                <td class="text-end">
                  <!-- PENDENTE -->
                  <ng-container *ngIf="s.status === 'PENDENTE'">
                    <div class="btn-group btn-group-sm" *ngIf="auth.hasRole('ADMINISTRADOR') || (!isMinhaSolicitacao(s) && auth.hasRole('COLABORADOR'))">
                      <button class="btn btn-success" (click)="aprovarEspaco(s.id)"><i class="bi bi-check-lg"></i> Aprovar</button>
                      <button class="btn btn-danger" (click)="reprovarEspaco(s.id)"><i class="bi bi-x-lg"></i> Reprovar</button>
                    </div>
                    <span *ngIf="isMinhaSolicitacao(s) && !auth.hasRole('ADMINISTRADOR')" class="badge bg-light text-muted border py-2 px-3">
                      <i class="bi bi-hourglass-split me-1"></i> Aguardando moderação
                    </span>
                  </ng-container>

                  <!-- APROVADA (RF 10.4: Somente o solicitante libera) -->
                  <ng-container *ngIf="s.status === 'APROVADA'">
                    <button *ngIf="isMinhaSolicitacao(s)" class="btn btn-outline-primary btn-sm" (click)="finalizarUsoEspaco(s.id)">
                      <i class="bi bi-box-arrow-down-left me-1"></i> Liberar Espaço
                    </button>
                    <span *ngIf="!isMinhaSolicitacao(s)" class="badge bg-light text-secondary border py-2 px-3">
                      <i class="bi bi-lock me-1"></i> Em uso / Reservado
                    </span>
                  </ng-container>

                  <span *ngIf="s.status === 'REPROVADA' || s.status === 'FINALIZADA'" class="text-muted small">Concluído</span>
                </td>
              </tr>
              <tr *ngIf="solicitacoesEspacos.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Nenhuma solicitação de espaço registrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= ABA 2: MODERAÇÃO DE SOFTWARES (RF 8) ================= -->
      <div *ngIf="abaAtiva === 'SOFTWARES'" class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small">
              <tr>
                <th>ID</th><th>Laboratório</th><th>Software Solicitado</th><th>Solicitante</th><th>Disciplina</th><th>Data Limite</th><th>Status</th><th class="text-end">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sw of solicitacoesSoftwares">
                <td>#{{ sw.id }}</td>
                <td class="fw-semibold">{{ sw.laboratorioNome || sw.laboratorio?.nome }}</td>
                <td>{{ sw.softwareNome || sw.software?.nome }}</td>
                <td>
                  {{ sw.solicitanteNome || sw.solicitante?.nomeCompleto }}
                  <span *ngIf="isMinhaSolicitacao(sw)" class="badge bg-secondary-subtle text-secondary border ms-1">Você</span>
                </td>
                <td>{{ sw.disciplina || '-' }}</td>
                <td>{{ sw.dataLimiteNecessidade }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': sw.status === 'PENDENTE',
                    'bg-success': sw.status === 'APROVADA',
                    'bg-danger': sw.status === 'REPROVADA'
                  }">{{ sw.status }}</span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm" *ngIf="sw.status === 'PENDENTE' && (auth.hasRole('ADMINISTRADOR') || (!isMinhaSolicitacao(sw) && auth.hasRole('COLABORADOR')))">
                    <button class="btn btn-success" (click)="aprovarSoftware(sw.id)" title="Aprovar Instalação (RF 8.1)">
                      <i class="bi bi-check-lg"></i> Aprovar
                    </button>
                    <button class="btn btn-danger" (click)="reprovarSoftware(sw.id)" title="Reprovar com Justificativa (RF 8.2)">
                      <i class="bi bi-x-lg"></i> Reprovar
                    </button>
                  </div>
                  <span *ngIf="sw.status === 'PENDENTE' && isMinhaSolicitacao(sw) && !auth.hasRole('ADMINISTRADOR')" class="badge bg-light text-muted border py-2 px-3">
                    <i class="bi bi-hourglass-split me-1"></i> Aguardando moderação
                  </span>
                  <span *ngIf="sw.status !== 'PENDENTE'" class="text-muted small">Concluído</span>
                </td>
              </tr>
              <tr *ngIf="solicitacoesSoftwares.length === 0">
                <td colspan="8" class="text-center text-muted py-4">Nenhuma solicitação de instalação de software registrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class GestaoSolicitacoesComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  abaAtiva: 'ESPACOS' | 'SOFTWARES' = 'ESPACOS';
  solicitacoesEspacos: any[] = [];
  solicitacoesSoftwares: any[] = [];
  alerta = '';
  alertaSucesso = true;

  ngOnInit() {
    this.carregarSolicitacoes();
  }

  trocarAba(aba: 'ESPACOS' | 'SOFTWARES') {
    this.abaAtiva = aba;
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes() {
    if (this.abaAtiva === 'ESPACOS') {
      this.http.get<any[]>('http://localhost:8080/api/solicitacoes-reservas').subscribe({
        next: (data) => this.solicitacoesEspacos = data,
        error: () => this.exibirAlerta('Erro ao carregar reservas de espaço.', false)
      });
    } else {
      this.http.get<any[]>('http://localhost:8080/api/solicitacoes-softwares').subscribe({
        next: (data) => this.solicitacoesSoftwares = data,
        error: () => this.exibirAlerta('Erro ao carregar solicitações de software.', false)
      });
    }
  }

  isMinhaSolicitacao(s: any): boolean {
    const userId = this.auth.getUserId();
    const userEmail = this.auth.getUserLogin();
    const userNome = this.auth.getUserNome();

    if (userId && (s.solicitanteId === userId || s.solicitante?.id === userId)) return true;
    if (userEmail && (s.solicitanteEmail === userEmail || s.solicitante?.email === userEmail)) return true;
    if (userNome && (s.solicitanteNome === userNome || s.solicitante?.nomeCompleto === userNome)) return true;
    return false;
  }

  aprovarEspaco(id: number) {
    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/aprovar?avaliadorId=${avaliadorId}`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Reserva aprovada com sucesso! O espaço tornou-se INDISPONÍVEL.', true);
        this.carregarSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao aprovar espaço.', false)
    });
  }

  reprovarEspaco(id: number) {
    const motivo = prompt('Informe a justificativa da reprovação:');
    if (!motivo) return;

    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/reprovar`, {
      avaliadorId: avaliadorId,
      motivo: motivo
    }).subscribe({
      next: () => {
        this.exibirAlerta('Solicitação de reserva reprovada com justificativa.', true);
        this.carregarSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao reprovar reserva.', false)
    });
  }

  finalizarUsoEspaco(id: number) {
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/finalizar`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Uso finalizado! O espaço retornou para DISPONÍVEL (RF 10.4).', true);
        this.carregarSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao finalizar uso.', false)
    });
  }

  aprovarSoftware(id: number) {
    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-softwares/${id}/aprovar?avaliadorId=${avaliadorId}`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Instalação de software aprovada com sucesso (RF 8.1)!', true);
        this.carregarSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao aprovar instalação de software.', false)
    });
  }

  reprovarSoftware(id: number) {
    const motivo = prompt('Informe a justificativa técnica para a reprovação da instalação (RF 8.2):');
    if (!motivo) return;

    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-softwares/${id}/reprovar`, {
      avaliadorId: avaliadorId,
      motivo: motivo
    }).subscribe({
      next: () => {
        this.exibirAlerta('Instalação de software reprovada com justificativa técnica registrada.', true);
        this.carregarSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao reprovar software.', false)
    });
  }

  private exibirAlerta(msg: string, sucesso: boolean) {
    this.alerta = msg;
    this.alertaSucesso = sucesso;
    setTimeout(() => this.alerta = '', 6000);
  }
}
