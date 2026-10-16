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
      <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
        <span><i class="bi bi-clock-history me-1 text-primary"></i>Fila de Solicitações de Reserva de Espaço</span>
        <button class="btn btn-outline-primary btn-sm" (click)="carregarSolicitacoes()">
          <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
        </button>
      </div>

      <div *ngIf="alerta" class="alert m-3 py-2 small" [ngClass]="alertaSucesso ? 'alert-success' : 'alert-danger'">
        {{ alerta }}
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small">
              <tr>
                <th>ID</th>
                <th>Espaço</th>
                <th>Solicitante</th>
                <th>Data & Horário</th>
                <th>Status</th>
                <th class="text-end">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of solicitacoes">
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
                  <!-- ESTADO PENDENTE: Regras de Moderação e Autor -->
                  <ng-container *ngIf="s.status === 'PENDENTE'">
                    <!-- 1. Superusuário ADMIN: tem poder irrestrito para aprovar/reprovar qualquer solicitação (mesmo a dele) -->
                    <div class="btn-group btn-group-sm" *ngIf="auth.hasRole('ADMINISTRADOR')">
                      <button class="btn btn-success" (click)="aprovar(s.id)" title="Aprovar Reserva">
                        <i class="bi bi-check-lg"></i> Aprovar
                      </button>
                      <button class="btn btn-danger" (click)="abrirReprovacao(s.id)" title="Reprovar com Justificativa">
                        <i class="bi bi-x-lg"></i> Reprovar
                      </button>
                    </div>

                    <!-- 1. Se pertence ao próprio utilizador logado: apenas aguarda moderação -->
                    <span *ngIf="isMinhaSolicitacao(s) && !auth.hasRole('ADMINISTRADOR')"
                          class="badge bg-light text-muted border py-2 px-3">
                      <i class="bi bi-hourglass-split me-1"></i> Aguardando moderação
                    </span>

                    <!-- 2. Se pertence a outro docente e quem está logado é COLABORADOR ou ADMIN: exibe aprovação/reprovação -->
                    <div class="btn-group btn-group-sm" *ngIf="!isMinhaSolicitacao(s) && !auth.hasRole('ADMINISTRADOR') && auth.hasRole('COLABORADOR')">
                      <button class="btn btn-success" (click)="aprovar(s.id)" title="Aprovar Reserva">
                        <i class="bi bi-check-lg"></i> Aprovar
                      </button>
                      <button class="btn btn-danger" (click)="abrirReprovacao(s.id)" title="Reprovar com Justificativa">
                        <i class="bi bi-x-lg"></i> Reprovar
                      </button>
                    </div>

                    <!-- 3. Se for um docente regular (apenas USUARIO) vendo pedido de outro docente: não tem ações de moderação -->
                    <span *ngIf="!isMinhaSolicitacao(s) && !auth.hasRole('ADMINISTRADOR') && !auth.hasRole('COLABORADOR')"
                          class="text-muted small">
                      Em análise
                    </span>
                  </ng-container>

                  <!-- ESTADO APROVADA: Liberação de Espaço (RF 10.4) -->
                  <ng-container *ngIf="s.status === 'APROVADA'">
                    <!-- O próprio solicitante que usou o espaço (ou o Admin) pode confirmar a liberação -->
                    <button *ngIf="isMinhaSolicitacao(s)"class="btn btn-outline-primary btn-sm" (click)="finalizarUso(s.id)"
                      title="Confirmar término do uso e liberar o espaço físico (RF 10.4)">
                      <i class="bi bi-box-arrow-down-left me-1"></i> Liberar Espaço
                    </button>

                  <!-- Qualquer terceiro (incluindo o Administrador) visualiza apenas o estado de ocupação -->
                    <span *ngIf="!isMinhaSolicitacao(s)" class="badge bg-light text-secondary border py-2 px-3">
                      <i class="bi bi-lock me-1"></i> Em uso / Reservado
                    </span>
                  </ng-container>

                  <!-- ESTADO REPROVADA OU FINALIZADA -->
                  <span *ngIf="s.status === 'REPROVADA' || s.status === 'FINALIZADA'" class="text-muted small">
                    Concluído
                  </span>
                </td>
              </tr>
              <tr *ngIf="solicitacoes.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Nenhuma solicitação registrada no momento.</td>
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

  solicitacoes: any[] = [];
  alerta = '';
  alertaSucesso = true;

  ngOnInit() {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes() {
    this.http.get<any[]>('http://localhost:8080/api/solicitacoes-reservas').subscribe({
      next: (data) => this.solicitacoes = data,
      error: () => this.exibirAlerta('Erro ao carregar solicitações.', false)
    });
  }

  isMinhaSolicitacao(s: any): boolean {
    const userId = this.auth.getUserId();
    const userEmail = this.auth.getUserLogin();
    const userNome = this.auth.getUserNome();

    if (userId && (s.solicitanteId === userId || s.solicitante?.id === userId)) {
      return true;
    }
    if (userEmail && (s.solicitanteEmail === userEmail || s.solicitante?.email === userEmail)) {
      return true;
    }
    if (userNome && (s.solicitanteNome === userNome || s.solicitante?.nomeCompleto === userNome)) {
      return true;
    }

    return false;
  }

  aprovar(id: number) {
    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/aprovar?avaliadorId=${avaliadorId}`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Reserva aprovada com sucesso! O espaço tornou-se INDISPONÍVEL.', true);
        this.carregarSolicitacoes();
      },
      error: (err) => {
        this.exibirAlerta(this.extrairMensagemErro(err, 'Erro ao aprovar solicitação.'), false);
      }
    });
  }

  abrirReprovacao(id: number) {
    const motivo = prompt('Informe a justificativa da reprovação:');
    if (!motivo) return;

    const avaliadorId = this.auth.getUserId();
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/reprovar`, {
      avaliadorId: avaliadorId,
      motivo: motivo
    }).subscribe({
      next: () => {
        this.exibirAlerta('Solicitação reprovada com justificativa.', true);
        this.carregarSolicitacoes();
      },
      error: (err) => {
        this.exibirAlerta(this.extrairMensagemErro(err, 'Erro ao reprovar solicitação.'), false);
      }
    });
  }

  finalizarUso(id: number) {
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/finalizar`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Uso finalizado! O espaço retornou automaticamente para DISPONÍVEL (RF 10.4).', true);
        this.carregarSolicitacoes();
      },
      error: (err) => {
        this.exibirAlerta(this.extrairMensagemErro(err, 'Erro ao finalizar uso.'), false);
      }
    });
  }

  private extrairMensagemErro(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        return parsed.message || parsed.mensagem || err.error;
      } catch {
        return err.error;
      }
    }
    return err.error?.message || err.error?.mensagem || fallback;
  }

  private exibirAlerta(msg: string, sucesso: boolean) {
    this.alerta = msg;
    this.alertaSucesso = sucesso;
    setTimeout(() => this.alerta = '', 6000);
  }
}
