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
        <button class="nav-link" [class.active]="abaAtiva === 'ESPACO'" (click)="abaAtiva = 'ESPACO'">
          <i class="bi bi-door-open me-1"></i> Reserva de Espaço (RF 10)
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="abaAtiva === 'SOFTWARE'" (click)="abaAtiva = 'SOFTWARE'">
          <i class="bi bi-cpu me-1"></i> Instalação de Software (RF 11)
        </button>
      </li>
    </ul>

    <div *ngIf="alerta" class="alert mb-3 py-2 small" [ngClass]="alertaSucesso ? 'alert-success' : 'alert-danger'">
      {{ alerta }}
    </div>

    <!-- ABA 1: RESERVA DE ESPAÇOS FÍSICOS -->
    <div *ngIf="abaAtiva === 'ESPACO'" class="row">
      <div class="col-lg-5 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3 text-primary">
            <i class="bi bi-send me-1"></i> Nova Solicitação de Espaço
          </div>
          <div class="card-body">
            <form (ngSubmit)="enviarReservaEspaco()">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Espaço Especial (Laboratórios & Auditórios)</label>
                <select class="form-select" [(ngModel)]="reserva.espacoId" name="espacoId" required>
                  <option [ngValue]="null">Selecione o espaço sob demanda...</option>
                  <option *ngFor="let espaco of espacosReservaveis" [ngValue]="espaco.id">
                    [{{ espaco.tipo }}] {{ espaco.sigla }} - {{ espaco.nome }} ({{ espaco.capacidadeMaxima }} lugares)
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Data de Utilização</label>
                <input type="date" class="form-control" [(ngModel)]="reserva.dataUtilizacao" name="data" required>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Início</label>
                  <input type="time" class="form-control" [(ngModel)]="reserva.horaInicio" name="inicio" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-semibold">Fim</label>
                  <input type="time" class="form-control" [(ngModel)]="reserva.horaFim" name="fim" required>
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

      <div class="col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3">
            <span><i class="bi bi-card-checklist me-1 text-primary"></i>Espaços Sob Demanda Homologados</span>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small">
                <tr><th>Nome</th><th>Tipo</th><th>Capacidade</th><th>Status</th></tr>
              </thead>
              <tbody class="small">
                <tr *ngFor="let e of espacosReservaveis">
                  <td class="fw-semibold">{{ e.nome }}</td>
                  <td><span class="badge" [ngClass]="e.tipo === 'LABORATORIO' ? 'bg-primary' : 'bg-info text-dark'">{{ e.tipo }}</span></td>
                  <td>{{ e.capacidadeMaxima }} lugares</td>
                  <td><span class="badge bg-success">{{ e.status || e.statusOperacional || 'DISPONIVEL' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ABA 2: INSTALAÇÃO DE SOFTWARES (RF 11) -->
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
                <textarea class="form-control" rows="3" [(ngModel)]="softwareForm.justificativaUso" name="justificativa" placeholder="Descreva os objetivos práticos do software para a turma..." required></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Enviar Pedido de Software
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Catálogo de Softwares Disponíveis -->
      <div class="col-lg-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold py-3">
            <span><i class="bi bi-hdd-network me-1 text-primary"></i>Catálogo Institucional de Softwares Homologados</span>
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
                <tr *ngIf="softwaresCatalogo.length === 0">
                  <td colspan="3" class="text-center text-muted py-4">Nenhum software cadastrado no catálogo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SolicitarReservaComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  abaAtiva: 'ESPACO' | 'SOFTWARE' = 'ESPACO';
  loading = false;
  alerta = '';
  alertaSucesso = true;

  espacosReservaveis: any[] = [];
  laboratorios: any[] = [];
  softwaresCatalogo: any[] = [];

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

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    // 1. Carrega espaços reserváveis (Laboratórios e Auditórios)
    this.http.get<any[]>('http://localhost:8080/api/espacos-academicos').subscribe({
      next: (data) => {
        this.espacosReservaveis = data.filter(e => e.tipo === 'LABORATORIO' || e.tipo === 'AUDITORIO');
        this.laboratorios = data.filter(e => e.tipo === 'LABORATORIO');
      }
    });

    // 2. Carrega catálogo de softwares homologados
    this.http.get<any[]>('http://localhost:8080/api/softwares').subscribe({
      next: (data) => this.softwaresCatalogo = data
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
        this.exibirAlerta('Solicitação de reserva de espaço enviada com sucesso!', true);
        this.reserva.espacoId = null;
        this.reserva.dataUtilizacao = '';
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
        this.exibirAlerta('Solicitação de instalação de software enviada com sucesso (RF 11)!', true);
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

  private exibirAlerta(msg: string, sucesso: boolean) {
    this.alerta = msg;
    this.alertaSucesso = sucesso;
    setTimeout(() => this.alerta = '', 6000);
  }
}
