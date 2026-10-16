import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None, // Permite que as regras de @page e impressão atuem globalmente
  template: `
    <div class="container-fluid py-3 relatorio-container">

      <!-- Cabeçalho e Ações (ocultos na impressão) -->
      <div class="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <div>
          <h4 class="fw-bold mb-1 text-primary">
            <i class="bi bi-file-earmark-bar-graph me-2"></i>Central de Emissão de Relatórios Oficiais
          </h4>
          <p class="text-muted small mb-0">Consolidação de dados estruturais, recursos humanos e alocação de espaços físicos.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="modoJson = !modoJson">
            <i class="bi" [ngClass]="modoJson ? 'bi-table me-1' : 'bi-code-slash me-1'"></i>
            {{ modoJson ? 'Ver Tabelas Formatadas' : 'Ver JSON Técnico' }}
          </button>
          <button class="btn btn-primary btn-sm px-3 shadow-sm" (click)="imprimirRelatorio()">
            <i class="bi bi-printer me-1"></i> Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      <!-- Abas de Navegação (ocultas na impressão) -->
      <ul class="nav nav-pills mb-4 border-bottom pb-2 d-print-none">
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'estrutural'" (click)="trocarAba('estrutural')">
            <i class="bi bi-diagram-3 me-1"></i> Estrutural (IES, CAs e Cursos)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'docentes'" (click)="trocarAba('docentes')">
            <i class="bi bi-people me-1"></i> Corpo Docente & CAs
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'espacos'" (click)="trocarAba('espacos')">
            <i class="bi bi-clock-history me-1"></i> Espaços & Movimentação
          </button>
        </li>
      </ul>

      <!-- Bloco Timbrado Oficial de Emissão -->
      <div class="card border mb-4 documento-oficial-card">

        <!-- Cabeçalho do Documento -->
        <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span class="badge bg-primary text-white text-uppercase px-2 py-1 me-2">Documento Oficial</span>
            <h6 class="fw-bold text-dark text-uppercase mb-0">
              {{ abaAtiva === 'estrutural' ? 'Relatório de Estrutura Organizacional e Cursos' : '' }}
              {{ abaAtiva === 'docentes' ? 'Relatório de Cadastro de Utilizadores e Docentes' : '' }}
              {{ abaAtiva === 'espacos' ? 'Relatório de Ocupação e Recursos Sob Demanda' : '' }}
            </h6>
          </div>
          <div class="text-end small text-muted">
            <span><strong>Emissão:</strong> {{ dadosAtuais?.emissor?.dataHoraEmissao | date:'dd/MM/yyyy HH:mm:ss' }}</span>
          </div>
        </div>

        <!-- Metadados do Emissor Auditado -->
        <div class="card-body bg-light border-bottom py-2">
          <div class="row small text-secondary align-items-center">
            <div class="col-sm-4 mb-1 mb-sm-0">
              <strong>Emissor:</strong> {{ dadosAtuais?.emissor?.nome || 'Administrador Geral' }}
            </div>
            <div class="col-sm-3 mb-1 mb-sm-0">
              <strong>Matrícula / Registo:</strong>
              <span class="badge bg-secondary-subtle text-secondary border ms-1">{{ dadosAtuais?.emissor?.identificacao || 'ADM-001' }}</span>
            </div>
            <div class="col-sm-5">
              <strong>Perfil de Acesso:</strong>
              <span class="text-dark fw-semibold ms-1">{{ formatarPerfis(dadosAtuais?.emissor?.perfil) }}</span>
            </div>
          </div>
        </div>

        <!-- ================= MODO 1: TABELAS FORMATADAS ================= -->
        <div *ngIf="!modoJson" class="card-body p-0">

          <!-- 1. ABA ESTRUTURAL -->
          <div *ngIf="abaAtiva === 'estrutural'" class="p-3">
            <div *ngFor="let ies of dadosAtuais?.instituicoes" class="card border mb-3 subcard-ies">
              <div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
                <div>
                  <h6 class="mb-0 fw-bold text-primary">
                    <i class="bi bi-bank me-2"></i>{{ ies.sigla }} — {{ ies.nome }}
                  </h6>
                  <small class="text-muted">Reitor(a): {{ ies.reitor || 'Não especificado' }}</small>
                </div>
                <span class="badge bg-success">{{ ies.status || 'ATIVO' }}</span>
              </div>
              <div class="card-body p-0">
                <table class="table table-hover align-middle mb-0 small tabela-relatorio">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 60px;">ID</th>
                      <th>Centro Académico (CA)</th>
                      <th>Coordenador Responsável</th>
                      <th>Cursos Vinculados</th>
                      <th style="width: 90px;" class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ca of ies.centros">
                      <td class="fw-bold">#{{ ca.id }}</td>
                      <td class="fw-semibold">{{ ca.nome }}</td>
                      <td>{{ ca.coordenador || 'A designar' }}</td>
                      <td>
                        <!-- Tratamento dinâmico sem [object Object] -->
                        <ng-container *ngIf="ca.cursos && ca.cursos.length > 0; else semCursos">
                          <span *ngFor="let c of ca.cursos" class="badge bg-light text-dark border me-1 my-1">
                            {{ obterNomeCurso(c) }}
                          </span>
                        </ng-container>
                        <ng-template #semCursos>
                          <span class="text-muted fst-italic">Cursos sob coordenação geral</span>
                        </ng-template>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-success">{{ ca.status || 'ATIVO' }}</span>
                      </td>
                    </tr>
                    <tr *ngIf="!ies.centros || ies.centros.length === 0">
                      <td colspan="5" class="text-center text-muted py-3">Nenhum Centro Académico associado a esta instituição.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 2. ABA CORPO DOCENTE -->
          <div *ngIf="abaAtiva === 'docentes'" class="area-tabela">
            <table class="table table-hover align-middle mb-0 small tabela-relatorio">
              <thead class="table-light">
                <tr>
                  <th class="text-nowrap" style="width: 110px;">Matrícula</th>
                  <th class="text-nowrap">Nome Completo</th>
                  <th>E-mail Institucional</th>
                  <th class="text-nowrap" style="width: 140px;">Telefone</th>
                  <th>Centro Académico</th>
                  <th class="text-nowrap">Perfis Atribuídos</th>
                  <th style="width: 80px;" class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of dadosAtuais?.docentes">
                  <td class="text-nowrap"><span class="badge bg-light text-dark border">{{ doc.matricula }}</span></td>
                  <td class="fw-semibold text-nowrap">{{ doc.nomeCompleto }}</td>
                  <td>{{ doc.email }}</td>
                  <td class="text-nowrap">{{ doc.telefone || '-' }}</td>
                  <td>{{ doc.centroAcademico || 'Administração Central' }}</td>
                  <td class="text-nowrap">
                    <span *ngFor="let perfil of normalizarArray(doc.perfis)"
                          class="badge me-1"
                          [ngClass]="{
                            'bg-primary': perfil === 'ADMINISTRADOR',
                            'bg-info text-dark': perfil === 'COLABORADOR',
                            'bg-secondary': perfil === 'USUARIO'
                          }">
                      {{ perfil }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-success">{{ doc.status || 'ATIVO' }}</span>
                  </td>
                </tr>
                <tr *ngIf="!dadosAtuais?.docentes || dadosAtuais?.docentes.length === 0">
                  <td colspan="7" class="text-center text-muted py-4">Nenhum docente listado no relatório.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 3. ABA ESPAÇOS & MOVIMENTAÇÃO -->
          <div *ngIf="abaAtiva === 'espacos'" class="area-tabela">
            <table class="table table-hover align-middle mb-0 small tabela-relatorio">
              <thead class="table-light">
                <tr>
                  <th style="width: 90px;">Sigla</th>
                  <th>Nome do Espaço Físico</th>
                  <th style="width: 130px;">Tipo</th>
                  <th style="width: 110px;">Capacidade</th>
                  <th>Centro Académico Vinculado</th>
                  <th style="width: 140px;" class="text-center">Disponibilidade</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let espaco of dadosAtuais?.espacos">
                  <td><span class="badge bg-light text-dark border">{{ espaco.sigla }}</span></td>
                  <td class="fw-semibold">{{ espaco.nome }}</td>
                  <td>
                    <span class="badge" [ngClass]="espaco.tipo === 'LABORATORIO' ? 'bg-primary' : 'bg-info text-dark'">
                      {{ espaco.tipo }}
                    </span>
                  </td>
                  <td>{{ espaco.capacidade }} lugares</td>
                  <td>{{ espaco.centroAcademico || 'Geral' }}</td>
                  <td class="text-center">
                    <span class="badge" [ngClass]="espaco.status === 'DISPONIVEL' ? 'bg-success' : 'bg-warning text-dark'">
                      {{ espaco.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="!dadosAtuais?.espacos || dadosAtuais?.espacos.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">Nenhum espaço registado no relatório.</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <!-- ================= MODO 2: JSON TÉCNICO ================= -->
        <div *ngIf="modoJson" class="card-body p-3">
          <pre class="bg-dark text-success p-3 rounded mb-0" style="max-height: 480px; overflow-y: auto; font-size: 0.82rem;"><code>{{ dadosAtuais | json }}</code></pre>
        </div>

        <div class="card-footer bg-white text-muted small py-2 d-flex justify-content-between">
          <span>Sistema Integrado de Gestão de Espaços Académicos (IES Service)</span>
          <span>Autenticidade e rastreabilidade validadas</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Ecrã Normal */
    .tabela-relatorio th {
      white-space: nowrap;
      background-color: #f8f9fa;
      font-weight: 600;
    }

    /* REGRAS GLOBAIS DE IMPRESSÃO (PDF / A4) */
    @media print {
      @page {
        size: landscape;
        margin: 8mm 10mm 8mm 10mm;
      }

      /* 1. Ocultar absolutamente a navbar e tudo o que estiver fora do relatório */
      app-navbar,
      nav,
      .navbar,
      header,
      .d-print-none {
        display: none !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      html, body {
        background-color: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .relatorio-container {
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      /* 2. Permite que o container quebre suavemente se necessário, sem criar folha vazia */
      .documento-oficial-card {
        border: 1px solid #dee2e6 !important;
        box-shadow: none !important;
        margin: 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      .subcard-ies {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin-bottom: 8px !important;
      }

      .area-tabela {
        overflow: visible !important;
        display: block !important;
        width: 100% !important;
      }

      .tabela-relatorio {
        width: 100% !important;
        table-layout: auto !important;
        font-size: 11px !important;
      }

      .tabela-relatorio th,
      .tabela-relatorio td {
        padding: 5px 8px !important;
        vertical-align: middle !important;
      }

      .badge {
        border: 1px solid #777 !important;
        font-size: 9.5px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `]
})
export class RelatoriosComponent implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/relatorios';

  abaAtiva: 'estrutural' | 'docentes' | 'espacos' = 'estrutural';
  modoJson: boolean = false;
  dadosAtuais: any = null;

  ngOnInit(): void {
    this.carregarRelatorio(this.abaAtiva);
  }

  trocarAba(aba: 'estrutural' | 'docentes' | 'espacos'): void {
    this.abaAtiva = aba;
    this.carregarRelatorio(aba);
  }

  carregarRelatorio(tipo: string): void {
    let endpoint = `${this.baseUrl}/estrutural`;
    if (tipo === 'docentes') endpoint = `${this.baseUrl}/docentes`;
    if (tipo === 'espacos') endpoint = `${this.baseUrl}/espacos-solicitacoes`;

    this.http.get<any>(endpoint).subscribe({
      next: (dados) => {
        this.dadosAtuais = dados;
      },
      error: (err) => {
        console.error(`Erro ao carregar relatório ${tipo}:`, err);
      }
    });
  }

  imprimirRelatorio(): void {
    window.print();
  }

  // Extrai com segurança o nome do curso de qualquer estrutura de objeto retornada
  obterNomeCurso(c: any): string {
    if (!c) return '';
    if (typeof c === 'string') return c;
    if (c.nome) return c.nome;
    if (c.nomeCurso) return c.nomeCurso;
    if (c.denominacao) return c.denominacao;
    if (c.descricao) return c.descricao;
    if (c.sigla) return c.sigla;
    if (c.codigo) return c.codigo;
    if (c.titulo) return c.titulo;

    // Procura o primeiro valor de texto válido dentro do objeto
    const valorTexto = Object.values(c).find(v => typeof v === 'string' && (v as string).trim().length > 0);
    return valorTexto ? String(valorTexto) : 'Curso';
  }

  formatarPerfis(perfilRaw: any): string {
    if (!perfilRaw) return 'Docente / Utilizador';
    if (Array.isArray(perfilRaw)) return perfilRaw.join(', ');
    return String(perfilRaw).replace(/[\[\]"]/g, '').split(',').map(p => p.trim()).join(', ');
  }

  normalizarArray(item: any): string[] {
    if (Array.isArray(item)) return item;
    if (typeof item === 'string') {
      return item.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  }
}
