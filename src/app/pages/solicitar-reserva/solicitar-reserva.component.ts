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
    <!-- Navegação por Abas -->
    <ul class="nav nav-pills mb-4 border-bottom pb-3">
      <li class="nav-item">
        <button class="nav-link" [class.active]="abaAtiva === 'ESPACO'" (click)="trocarAba('ESPACO')">
          <i class="bi bi-door-open me-1"></i> Reserva de Espaço (RF 10)
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="abaAtiva === 'SOFTWARE'" (click)="trocarAba('SOFTWARE')">
          <i class="bi bi-cpu me-1"></i> Instalação de Software (RF 11)
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="abaAtiva === 'MEUS_PEDIDOS'" (click)="trocarAba('MEUS_PEDIDOS')">
          <i class="bi bi-card-checklist me-1"></i> Minhas Solicitações & Uso (RF 10 & 10.4)
          <span *ngIf="minhasReservasPendentes > 0" class="badge bg-danger ms-1">{{ minhasReservasPendentes }}</span>
        </button>
      </li>
    </ul>

    <div *ngIf="alerta" class="alert mb-3 py-2 small" [ngClass]="alertaSucesso ? 'alert-success' : 'alert-danger'">
      {{ alerta }}
    </div>

    <!-- =============== ABA 1: RESERVA DE ESPAÇOS =============== -->
      <div *ngIf="abaAtiva === 'ESPACO'" class="row">
        <!-- COLUNA ESQUERDA: FORMULÁRIO DE PEDIDO -->
        <div class="col-lg-5 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3 text-primary">
              <i class="bi bi-send me-1"></i> Nova Solicitação de Espaço
            </div>
            <div class="card-body">
              <form (ngSubmit)="enviarReservaEspaco()">
                <!-- SELETOR DE ESPAÇO -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Espaço Especial (Laboratórios & Auditórios)</label>
                  <select class="form-select" [(ngModel)]="reserva.espacoId" name="espacoId" required>
                    <option [ngValue]="null">Selecione o espaço sob demanda...</option>
                    <option *ngFor="let espaco of espacosReservaveis" [ngValue]="espaco.id">
                      [{{ espaco.tipo }}] {{ espaco.sigla }} - {{ espaco.nome }} ({{ espaco.capacidadeMaxima }} lugares)
                    </option>
                  </select>
                </div>

                <!-- DATA DE UTILIZAÇÃO -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Data de Utilização</label>
                  <input type="date" class="form-control" [(ngModel)]="reserva.dataUtilizacao" name="data" required>
                </div>

                <!-- ATALHOS RÁPIDOS DE TURNOS ACADÊMICOS -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted d-block mb-1">
                    <i class="bi bi-lightning-charge-fill text-warning me-1"></i>Atalhos Rápidos de Aulas:
                  </label>
                  <div class="d-flex flex-wrap gap-1">
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="definirHorario('07:30', '09:10')">07:30 - 09:10</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="definirHorario('09:20', '11:00')">09:20 - 11:00</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="definirHorario('13:30', '17:00')">13:30 - 17:00</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" (click)="definirHorario('18:40', '22:10')">18:40 - 22:10</button>
                  </div>
                </div>

                <!-- HORÁRIOS COMPACTOS -->
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Início</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light"><i class="bi bi-clock"></i></span>
                      <input type="time" class="form-control" [(ngModel)]="reserva.horaInicio" name="inicio" min="07:00" max="22:30" step="1800" required>
                    </div>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Fim</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light"><i class="bi bi-clock-history"></i></span>
                      <input type="time" class="form-control" [(ngModel)]="reserva.horaFim" name="fim" min="07:30" max="23:00" step="1800" required>
                    </div>
                  </div>
                </div>

                <!-- PAINEL VISUAL DE OCUPAÇÃO NA DATA (ESTILO CINEMA) -->
                <div *ngIf="reserva.espacoId && reserva.dataUtilizacao" class="card bg-light border-0 p-3 mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label small fw-bold mb-0 text-dark">
                      <i class="bi bi-calendar2-range text-primary me-1"></i>Ocupação Homologada nesta Data:
                    </label>
                    <span class="badge" [ngClass]="obterOcupacaoDia().length > 0 ? 'bg-warning text-dark' : 'bg-success'">
                      {{ obterOcupacaoDia().length > 0 ? 'Com Reservas' : 'Livre o dia todo' }}
                    </span>
                  </div>

                  <div *ngIf="obterOcupacaoDia().length === 0" class="text-success small fw-semibold">
                    <i class="bi bi-check-circle-fill me-1"></i>Espaço totalmente livre nesta data.
                  </div>

                  <div *ngIf="obterOcupacaoDia().length > 0" class="d-flex flex-wrap gap-2 mt-1">
                    <span *ngFor="let item of obterOcupacaoDia()" class="badge bg-danger shadow-sm py-2 px-2 fw-normal" [title]="'Solicitante: ' + item.solicitante">
                      <i class="bi bi-lock-fill me-1"></i>{{ item.inicio }} às {{ item.fim }} (Ocupado)
                    </span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                  Enviar Pedido de Espaço
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- COLUNA DIREITA: TABELA DE ESPAÇOS HOMOLOGADOS COM STATUS DINÂMICO -->
        <div class="col-lg-7">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <span class="text-primary"><i class="bi bi-card-checklist me-1"></i>Espaços Sob Demanda Homologados</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Capacidade</th>
                      <th class="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let espaco of espacosReservaveis">
                      <td class="fw-semibold">{{ espaco.nome }}</td>
                      <td>
                        <span class="badge" [ngClass]="espaco.tipo === 'LABORATORIO' ? 'bg-primary' : 'bg-info text-dark'">
                          {{ espaco.tipo }}
                        </span>
                      </td>
                      <td>{{ espaco.capacidadeMaxima }} lugares</td>
                      <td class="text-center">
                        <!-- Em Manutenção Física (RF 6.2) -->
                        <span *ngIf="espaco.status === 'MANUTENCAO' || espaco.status === 'INATIVO'" class="badge bg-secondary">
                          EM MANUTENÇÃO
                        </span>

                        <!-- Ocupação dinâmica na data selecionada no formulário -->
                        <span *ngIf="reserva.dataUtilizacao && temReservaAprovadaNoDia(espaco.id, reserva.dataUtilizacao) && espaco.status !== 'MANUTENCAO' && espaco.status !== 'INATIVO'" class="badge bg-warning text-dark">
                          RESERVAS NO DIA
                        </span>

                        <!-- Livre -->
                        <span *ngIf="(!reserva.dataUtilizacao || !temReservaAprovadaNoDia(espaco.id, reserva.dataUtilizacao)) && espaco.status !== 'MANUTENCAO' && espaco.status !== 'INATIVO'" class="badge bg-success">
                          DISPONÍVEL
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="espacosReservaveis.length === 0">
                      <td colspan="4" class="text-center text-muted py-4">Nenhum espaço homologado disponível.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- ================= ABA 2: INSTALAÇÃO DE SOFTWARES ================= -->
    <div *ngIf="abaAtiva === 'SOFTWARE'" class="row">
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3 text-primary">
            <i class="bi bi-box-arrow-in-down me-1"></i> Solicitar Instalação de Software em Laboratório
          </div>
          <div class="card-body">
            <form (ngSubmit)="enviarSolicitacaoSoftware()">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Laboratório Destino</label>
                <select class="form-select" [(ngModel)]="softwareForm.laboratorioId" name="labId" required>
                  <option [ngValue]="null">Selecione o laboratório...</option>
                  <option *ngFor="let lab of laboratorios" [ngValue]="lab.id">
                    {{ lab.sigla }} - {{ lab.nome }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Software Requerido</label>
                <select class="form-select" [(ngModel)]="softwareForm.softwareId" name="softId" required>
                  <option [ngValue]="null">Selecione o software do catálogo...</option>
                  <option *ngFor="let s of softwaresCatalogo" [ngValue]="s.id">
                    {{ s.nome }} (Versão {{ s.versao }}) - {{ s.tipo }}
                  </option>
                </select>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Disciplina / Atividade</label>
                  <input type="text" class="form-control" [(ngModel)]="softwareForm.disciplina" name="disciplina" placeholder="Ex: Compiladores" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Data Limite da Necessidade</label>
                  <input type="date" class="form-control" [(ngModel)]="softwareForm.dataLimiteNecessidade" name="dataLimite" required>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Justificativa de Uso Pedagógico</label>
                <textarea class="form-control" rows="3" [(ngModel)]="softwareForm.justificativaUso" name="justificativa" placeholder="Descreva os objetivos práticos do software..." required></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Enviar Pedido de Software
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3">
            <span><i class="bi bi-hdd-network me-1 text-primary"></i>Catálogo de Softwares Homologados</span>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small">
                <tr><th>Nome</th><th>Versão</th><th>Licença</th></tr>
              </thead>
              <tbody class="small">
                <tr *ngFor="let s of softwaresCatalogo">
                  <td class="fw-semibold">{{ s.nome }}</td>
                  <td>{{ s.versao }}</td>
                  <td><span class="badge bg-secondary">{{ s.tipo }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= ABA 3: MINHAS SOLICITAÇÕES (RF 10 & RF 10.4) ================= -->
    <div *ngIf="abaAtiva === 'MEUS_PEDIDOS'" class="card shadow-sm border-0">
      <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
        <span><i class="bi bi-person-lines-fill me-1 text-primary"></i>Histórico das Minhas Solicitações de Espaço</span>
        <button class="btn btn-outline-primary btn-sm" (click)="carregarMinhasSolicitacoes()">
          <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small">
              <tr>
                <th>ID</th>
                <th>Espaço Solicitado</th>
                <th>Data Prevista</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Parecer / Justificativa</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody class="small">
              <tr *ngFor="let s of minhasSolicitacoes">
                <td>#{{ s.id }}</td>
                <td class="fw-semibold">{{ s.espacoNome || s.espaco?.nome }}</td>
                <td>{{ s.dataUtilizacao }}</td>
                <td>{{ s.horaInicio }} às {{ s.horaFim }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': s.status === 'PENDENTE',
                    'bg-success': s.status === 'APROVADA',
                    'bg-danger': s.status === 'REPROVADA',
                    'bg-info': s.status === 'FINALIZADA'
                  }">{{ s.status }}</span>
                </td>
                <td>
                  <span *ngIf="s.status === 'REPROVADA'" class="text-danger">
                    <i class="bi bi-exclamation-triangle me-1"></i>{{ s.justificativaReprovacao || s.motivo || 'Sem justificativa.' }}
                  </span>
                  <span *ngIf="s.status === 'APROVADA'" class="text-success">
                    <i class="bi bi-check-circle me-1"></i>Aprovado por {{ s.avaliadorNome || 'Coordenação' }}
                  </span>
                  <span *ngIf="s.status === 'PENDENTE'" class="text-muted">
                    <i class="bi bi-hourglass-split me-1"></i>Aguardando avaliação do coordenador
                  </span>
                  <span *ngIf="s.status === 'FINALIZADA'" class="text-muted">
                    Espaço liberado e concluído
                  </span>
                </td>
                <td class="text-end">
                  <!-- SE PENDENTE: Pode cancelar / inativar a solicitação (RF 10) -->
                  <button *ngIf="s.status === 'PENDENTE'"
                          class="btn btn-outline-danger btn-sm"
                          (click)="cancelarMinhaSolicitacao(s.id)"
                          title="Cancelar e inativar pedido de reserva (RF 10)">
                    <i class="bi bi-trash me-1"></i> Cancelar
                  </button>

                  <!-- SE APROVADA: Pode liberar o espaço após uso (RF 10.4) -->
                  <button *ngIf="s.status === 'APROVADA'"
                          class="btn btn-success btn-sm"
                          (click)="liberarMeuEspaco(s.id)"
                          title="Confirmar término do uso e liberar o espaço para o campus (RF 10.4)">
                    <i class="bi bi-box-arrow-down-left me-1"></i> Liberar Espaço
                  </button>

                  <span *ngIf="s.status === 'REPROVADA' || s.status === 'FINALIZADA'" class="text-muted">
                    --
                  </span>
                </td>
              </tr>
              <tr *ngIf="minhasSolicitacoes.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Você ainda não submeteu solicitações de espaço.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SolicitarReservaComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  abaAtiva: 'ESPACO' | 'SOFTWARE' | 'MEUS_PEDIDOS' = 'ESPACO';
  loading = false;
  alerta = '';
  alertaSucesso = true;

  espacosReservaveis: any[] = [];
  laboratorios: any[] = [];
  softwaresCatalogo: any[] = [];
  minhasSolicitacoes: any[] = [];
  todasSolicitacoes: any[] = [];

  horariosDisponiveis: string[] = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];

  obterOcupacaoDia(): { inicio: string; fim: string; solicitante: string }[] {
    if (!this.reserva.espacoId || !this.reserva.dataUtilizacao) {
      return [];
    }

    const lista = this.todasSolicitacoes.length > 0 ? this.todasSolicitacoes : this.minhasSolicitacoes;

    return lista
      .filter((s: any) => {
        const mesmoEspaco = Number(s.espacoId || s.espaco?.id) === Number(this.reserva.espacoId);
        const mesmaData = s.dataUtilizacao === this.reserva.dataUtilizacao;
        const aprovada = s.status === 'APROVADA' || s.status === 'RESERVADO';
        return mesmoEspaco && mesmaData && aprovada;
      })
      .map((s: any) => ({
        inicio: s.horaInicio || s.horarioInicio || '',
        fim: s.horaFim || s.horarioFim || '',
        solicitante: s.solicitanteNome || s.nomeSolicitante || 'Reservado'
      }));
  }

  definirHorario(inicio: string, fim: string): void {
    this.reserva.horaInicio = inicio;
    this.reserva.horaFim = fim;
  }

  temReservaAprovadaNoDia(espacoId: number, data: string): boolean {
    return this.todasSolicitacoes.some(s =>
      Number(s.espacoId || s.espaco?.id) === Number(espacoId) &&
      s.dataUtilizacao === data &&
      (s.status === 'APROVADA' || s.status === 'RESERVADO')
    );
  }

  reserva = {
    espacoId: null as number | null,
    dataUtilizacao: '',
    horaInicio: '08:00',
    horaFim: '10:00'
  };

  softwareForm = {
    laboratorioId: null as number | null,
    softwareId: null as number | null,
    disciplina: '',
    dataLimiteNecessidade: '',
    justificativaUso: ''
  };

  get minhasReservasPendentes(): number {
    return this.minhasSolicitacoes.filter(s => s.status === 'PENDENTE').length;
  }

  ngOnInit() {
    this.carregarDados();
    this.carregarMinhasSolicitacoes();
  }

  trocarAba(aba: 'ESPACO' | 'SOFTWARE' | 'MEUS_PEDIDOS') {
    this.abaAtiva = aba;
    if (aba === 'MEUS_PEDIDOS') {
      this.carregarMinhasSolicitacoes();
    }
  }

  carregarDados() {
    this.http.get<any[]>('http://localhost:8080/api/espacos-academicos').subscribe({
      next: (data) => {
        this.espacosReservaveis = data.filter(e => e.tipo === 'LABORATORIO' || e.tipo === 'AUDITORIO');
        this.laboratorios = data.filter(e => e.tipo === 'LABORATORIO');
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/softwares').subscribe({
      next: (data) => this.softwaresCatalogo = data
    });
  }

  carregarMinhasSolicitacoes() {
    const userId = this.auth.getUserId();
    const userEmail = this.auth.getUserLogin();

    this.http.get<any[]>('http://localhost:8080/api/solicitacoes-reservas').subscribe({
      next: (todas) => {
        // Guarda todas as solicitações para calcular a grade de ocupação do dia (estilo cinema)
        this.todasSolicitacoes = todas;

        // Filtra de forma dinâmica exclusivamente as solicitações do usuário autenticado
        this.minhasSolicitacoes = todas.filter(s =>
          (userId && (s.solicitanteId === userId || s.solicitante?.id === userId)) ||
          (userEmail && (s.solicitanteEmail === userEmail || s.solicitante?.email === userEmail))
        );
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações:', err);
      }
    });
  }

  enviarReservaEspaco() {
    if (!this.reserva.espacoId || !this.reserva.dataUtilizacao) {
      this.exibirAlerta('Preencha todos os campos da reserva de espaço.', false);
      return;
    }

    this.loading = true;
    const payload = {
      solicitanteId: this.auth.getUserId(),
      espacoId: Number(this.reserva.espacoId),
      dataUtilizacao: this.reserva.dataUtilizacao,
      horaInicio: this.reserva.horaInicio,
      horaFim: this.reserva.horaFim
    };

    this.http.post('http://localhost:8080/api/solicitacoes-reservas', payload).subscribe({
      next: () => {
        this.loading = false;
        this.exibirAlerta('Solicitação enviada com sucesso! Acompanhe o status na aba Minhas Solicitações.', true);
        this.reserva.espacoId = null;
        this.reserva.dataUtilizacao = '';
        this.carregarMinhasSolicitacoes();
      },
      error: (err) => {
        this.loading = false;
        this.exibirAlerta(err.error?.message || 'Erro ao submeter reserva de espaço.', false);
      }
    });
  }

  enviarSolicitacaoSoftware() {
    if (!this.softwareForm.laboratorioId || !this.softwareForm.softwareId || !this.softwareForm.dataLimiteNecessidade || !this.softwareForm.justificativaUso) {
      this.exibirAlerta('Preencha os campos obrigatórios da solicitação de software.', false);
      return;
    }

    this.loading = true;
    const payload = {
      solicitanteId: this.auth.getUserId(),
      laboratorioId: Number(this.softwareForm.laboratorioId),
      softwareId: Number(this.softwareForm.softwareId),
      disciplina: this.softwareForm.disciplina,
      dataLimiteNecessidade: this.softwareForm.dataLimiteNecessidade,
      justificativaUso: this.softwareForm.justificativaUso
    };

    this.http.post('http://localhost:8080/api/solicitacoes-softwares', payload).subscribe({
      next: () => {
        this.loading = false;
        this.exibirAlerta('Solicitação de instalação enviada com sucesso (RF 11)!', true);
        this.softwareForm.laboratorioId = null;
        this.softwareForm.softwareId = null;
        this.softwareForm.disciplina = '';
        this.softwareForm.dataLimiteNecessidade = '';
        this.softwareForm.justificativaUso = '';
      },
      error: (err) => {
        this.loading = false;
        this.exibirAlerta(err.error?.message || 'Erro ao submeter pedido de software.', false);
      }
    });
  }

  liberarMeuEspaco(id: number) {
    this.http.patch(`http://localhost:8080/api/solicitacoes-reservas/${id}/finalizar`, {}).subscribe({
      next: () => {
        this.exibirAlerta('Uso finalizado e espaço desocupado com sucesso! Status retornado para DISPONÍVEL (RF 10.4).', true);
        this.carregarMinhasSolicitacoes();
      },
      error: (err) => this.exibirAlerta(err.error?.message || 'Erro ao liberar espaço.', false)
    });
  }

  cancelarMinhaSolicitacao(id: number) {
    if (!confirm('Deseja realmente cancelar esta solicitação pendente (RF 10)?')) return;

    // Dispara a exclusão/inativação no backend
    this.http.delete(`http://localhost:8080/api/solicitacoes-reservas/${id}`).subscribe({
      next: () => {
        this.exibirAlerta('Solicitação cancelada com sucesso.', true);
        this.carregarMinhasSolicitacoes();
      },
      error: (err) => {
        this.exibirAlerta(err.error?.message || 'Erro ao cancelar solicitação.', false);
      }
    });
  }

  private exibirAlerta(msg: string, sucesso: boolean) {
    this.alerta = msg;
    this.alertaSucesso = sucesso;
    setTimeout(() => this.alerta = '', 6000);
  }
}
