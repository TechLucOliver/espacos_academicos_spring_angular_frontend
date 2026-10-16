import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-solicitar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <!-- Formulário de Solicitação -->
      <div class="col-lg-5 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3 text-primary">
            <i class="bi bi-send me-1"></i> Nova Solicitação de Reserva
          </div>
          <div class="card-body">
            <div *ngIf="alerta" class="alert mb-3 py-2 small" [ngClass]="alertaSucesso ? 'alert-success' : 'alert-danger'">
              {{ alerta }}
            </div>

            <form (ngSubmit)="enviarSolicitacao()">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Espaço Especial (Laboratórios & Auditórios)</label>
                <select class="form-select" [(ngModel)]="solicitacao.espacoAcademicoId" name="espacoId" required>
                  <option [ngValue]="null">Selecione o espaço sob demanda...</option>
                  <option *ngFor="let espaco of espacosReservaveis" [ngValue]="espaco.id">
                    [{{ espaco.tipo }}] {{ espaco.sigla }} - {{ espaco.nome }} ({{ espaco.capacidadeMaxima }} lugares)
                  </option>
                </select>
                <div class="form-text text-muted small mt-1">
                  <i class="bi bi-info-circle me-1"></i>Salas de aula convencionais são alocadas pela matriz horária fixa.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Data de Utilização</label>
                <input type="date" class="form-control" [(ngModel)]="solicitacao.dataUtilizacao" name="data" required>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Início</label>
                  <input type="time" class="form-control" [(ngModel)]="solicitacao.horaInicio" name="inicio" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Fim</label>
                  <input type="time" class="form-control" [(ngModel)]="solicitacao.horaFim" name="fim" required>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Enviar Pedido de Reserva
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Tabela de Espaços Elegíveis -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
            <span><i class="bi bi-door-open me-1 text-primary"></i>Espaços Sob Demanda Homologados</span>
            <button class="btn btn-outline-secondary btn-sm" (click)="carregarEspacos()">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Capacidade</th>
                    <th>Status Operacional</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let e of espacosReservaveis">
                    <td class="fw-semibold">{{ e.nome }}</td>
                    <td>
                      <span class="badge" [ngClass]="e.tipo === 'LABORATORIO' ? 'bg-primary' : 'bg-info text-dark'">
                        {{ e.tipo }}
                      </span>
                    </td>
                    <td>{{ e.capacidadeMaxima }} lugares</td>
                    <td>
                      <span class="badge" [ngClass]="e.status === 'DISPONIVEL' || e.statusOperacional === 'DISPONIVEL' ? 'bg-success' : 'bg-danger'">
                        {{ e.status || e.statusOperacional || 'DISPONIVEL' }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="espacosReservaveis.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">Nenhum laboratório ou auditório disponível no momento.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SolicitarReservaComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  espacosReservaveis: any[] = [];
  loading = false;
  alerta = '';
  alertaSucesso = true;

  solicitacao = {
    espacoAcademicoId: null as number | null,
    dataUtilizacao: '',
    horaInicio: '08:00',
    horaFim: '10:00'
  };

  ngOnInit() {
    this.carregarEspacos();
  }

  carregarEspacos() {
    this.http.get<any[]>('http://localhost:8080/api/espacos-academicos').subscribe({
      next: (data) => {
        // Regra de Domínio: Apenas Laboratórios e Auditórios entram no fluxo de reserva pontual
        this.espacosReservaveis = data.filter(e => e.tipo === 'LABORATORIO' || e.tipo === 'AUDITORIO');
      },
      error: () => this.exibirAlerta('Erro ao carregar espaços acadêmicos.', false)
    });
  }

  enviarSolicitacao() {
    if (!this.solicitacao.espacoAcademicoId || !this.solicitacao.dataUtilizacao) {
      this.exibirAlerta('Preencha todos os campos obrigatórios da reserva.', false);
      return;
    }

    this.loading = true;
    const solicitanteId = this.auth.getUserId();

    const payload = {
      solicitanteId: solicitanteId,
      espacoId: this.solicitacao.espacoAcademicoId,
      dataUtilizacao: this.solicitacao.dataUtilizacao,
      horaInicio: this.solicitacao.horaInicio,
      horaFim: this.solicitacao.horaFim
    };

    this.http.post('http://localhost:8080/api/solicitacoes-reservas', payload).subscribe({
      next: () => {
        this.loading = false;
        this.exibirAlerta('Solicitação de reserva enviada com sucesso! Aguarde a moderação.', true);
        this.solicitacao.espacoAcademicoId = null;
        this.solicitacao.dataUtilizacao = '';
      },
      error: (err) => {
        this.loading = false;
        this.exibirAlerta(err.error?.message || 'Erro ao enviar pedido de reserva.', false);
      }
    });
  }

  private exibirAlerta(msg: string, sucesso: boolean) {
    this.alerta = msg;
    this.alertaSucesso = sucesso;
    setTimeout(() => this.alerta = '', 6000);
  }
}
