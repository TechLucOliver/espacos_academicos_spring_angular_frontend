import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-cadastros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <!-- Navegação de Abas -->
      <ul class="nav nav-pills mb-4 border-bottom pb-2">
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'ies'" (click)="abaAtiva = 'ies'">
            <i class="bi bi-bank me-1"></i> 1. IES & Pró-Reitorias
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'ca'" (click)="abaAtiva = 'ca'">
            <i class="bi bi-building me-1"></i> 2. Centros Académicos (CAs)
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'curso'" (click)="abaAtiva = 'curso'">
            <i class="bi bi-mortarboard me-1"></i> 3. Cursos
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'espaco'" (click)="abaAtiva = 'espaco'">
            <i class="bi bi-door-open me-1"></i> 4. Espaços Físicos
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'lab'" (click)="abaAtiva = 'lab'">
            <i class="bi bi-cpu me-1"></i> 5. Laboratórios
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'usuario'" (click)="abaAtiva = 'usuario'">
            <i class="bi bi-people me-1"></i> 6. Utilizadores & Docentes
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="abaAtiva === 'software'" (click)="abaAtiva = 'software'">
            <i class="bi bi-terminal me-1"></i> 7. Softwares & Licenças
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link"
              [class.active]="abaAtiva === 'logs'"
              (click)="abaAtiva = 'logs'; carregarLogs()">
            <i class="bi bi-journal-text me-1"></i> 8. Logs de Auditoria (RF 4)
          </button>
        </li>

      </ul>

      <!-- Mensagens de Alerta -->
      <div *ngIf="mensagemSucesso" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> {{ mensagemSucesso }}
        <button type="button" class="btn-close" (click)="mensagemSucesso = ''"></button>
      </div>
      <div *ngIf="mensagemErro" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ mensagemErro }}
        <button type="button" class="btn-close" (click)="mensagemErro = ''"></button>
      </div>

      <!-- ABA 1: IES -->
      <div *ngIf="abaAtiva === 'ies'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-plus-circle text-primary me-1"></i> Nova IES
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarIes()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Sigla</label>
                  <input type="text" class="form-control" [(ngModel)]="formIes.sigla" name="siglaIes" placeholder="Ex: UCSAL" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome da Instituição</label>
                  <input type="text" class="form-control" [(ngModel)]="formIes.nome" name="nomeIes" placeholder="Ex: Univ. Católica do Salvador" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">E-mail Central</label>
                  <input type="email" class="form-control" [(ngModel)]="formIes.emailCentral" name="emailIes" placeholder="contato@ies.br" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Telefone Central</label>
                  <input type="text" class="form-control" [(ngModel)]="formIes.telefoneCentral" name="telIes" placeholder="(71) 3203-8000" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Nome do Reitor</label>
                  <input type="text" class="form-control" [(ngModel)]="formIes.nomeReitor" name="nomeReitor" placeholder="Ex: Prof. Dr. Reitor" required>
                </div>

                <div class="border rounded p-2 bg-light mb-3">
                  <div class="fw-semibold small mb-2 text-secondary">
                    <i class="bi bi-diagram-2 me-1"></i> Pró-Reitorias & Nomeações (RF 2.1.1)
                  </div>
                  <div class="mb-2">
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="novaProReitoria.nome" name="prNome" placeholder="Ex: Pró-Reitoria Acadêmica">
                  </div>
                  <div class="mb-2">
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="novaProReitoria.nomeResponsavel" name="prResp" placeholder="Ex: Prof. Dr. Titular">
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary w-100" (click)="adicionarProReitoria()">
                    <i class="bi bi-plus-lg me-1"></i> Adicionar Pró-Reitoria
                  </button>
                  <ul class="list-group list-group-flush mt-2 small" *ngIf="formIes.proReitorias.length > 0">
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-1 py-1" *ngFor="let pr of formIes.proReitorias; let i = index">
                      <div>
                        <strong>{{ pr.nome }}</strong><br>
                        <span class="text-muted">{{ pr.nomeResponsavel }}</span>
                      </div>
                      <button type="button" class="btn btn-sm text-danger border-0" (click)="removerProReitoria(i)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </li>
                  </ul>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar IES
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Instituições Registadas</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarIes()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Sigla</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Reitor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let item of listaIes">
                    <td><span class="badge bg-secondary">{{ item.sigla }}</span></td>
                    <td class="fw-semibold">{{ item.nome }}</td>
                    <td>{{ item.emailCentral || item.email }}</td>
                    <td>{{ item.nomeReitor || item.reitor || 'Não informado' }}</td>
                    <td><span class="badge bg-success">{{ item.status || 'ATIVO' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 2: CENTROS ACADÉMICOS -->
      <div *ngIf="abaAtiva === 'ca'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-plus-circle text-primary me-1"></i> Novo Centro Académico (CA)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarCentro()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">IES Vinculada</label>
                  <select class="form-select" [(ngModel)]="formCentro.iesId" name="iesVinculada" required>
                    <option [ngValue]="null">Selecione a IES...</option>
                    <option *ngFor="let ies of listaIes" [ngValue]="ies.id">
                      {{ ies.sigla }} - {{ ies.nome }}
                    </option>
                  </select>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome do Centro Académico</label>
                  <input type="text" class="form-control" [(ngModel)]="formCentro.nome" name="nomeCentro" placeholder="Ex: Escola de Engenharias (CCET)" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">E-mail Central</label>
                  <input type="email" class="form-control" [(ngModel)]="formCentro.emailCentral" name="emailCentro" placeholder="ccet@ies.br" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Telefone Central</label>
                  <input type="text" class="form-control" [(ngModel)]="formCentro.telefoneCentral" name="telCentro" placeholder="(71) 3203-8100" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Nome do Coordenador</label>
                  <input type="text" class="form-control" [(ngModel)]="formCentro.nomeCoordenador" name="nomeCoordenador" placeholder="Nome do Coordenador" required>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Centro Académico
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Centros Académicos Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarCentros()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Centro / Escola</th>
                    <th>Coordenador</th>
                    <th>Contacto</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let ca of listaCentros">
                    <td class="fw-semibold">{{ ca.nome }}</td>
                    <td>{{ ca.nomeCoordenador || ca.coordenador || 'Não informado' }}</td>
                    <td>{{ ca.emailCentral || ca.email }}</td>
                    <td><span class="badge bg-success">{{ ca.status || 'ATIVO' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 3: CURSOS -->
      <div *ngIf="abaAtiva === 'curso'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-plus-circle text-primary me-1"></i> Novo Curso (RF 2.3)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarCurso()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Centro Académico Vinculado</label>
                  <select class="form-select" [(ngModel)]="formCurso.centroAcademicoId" name="cursoCa" required>
                    <option [ngValue]="null">Selecione o CA...</option>
                    <option *ngFor="let ca of listaCentros" [ngValue]="ca.id">
                      {{ ca.nome }}
                    </option>
                  </select>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Sigla do Curso</label>
                  <input type="text" class="form-control" [(ngModel)]="formCurso.sigla" name="siglaCurso" placeholder="Ex: BES, ADS, CCO" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Descrição / Nome do Curso</label>
                  <input type="text" class="form-control" [(ngModel)]="formCurso.descricao" name="descCurso" placeholder="Ex: Bacharelado em Engenharia de Software" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Turno de Oferta</label>
                  <select class="form-select" [(ngModel)]="formCurso.turno" name="turnoCurso" required>
                    <option value="MATUTINO">Matutino</option>
                    <option value="VESPERTINO">Vespertino</option>
                    <option value="NOTURNO">Noturno</option>
                    <option value="INTEGRAL">Integral</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Coordenador do Curso</label>
                  <input type="text" class="form-control" [(ngModel)]="formCurso.nomeCoordenador" name="coordCurso" placeholder="Nome do coordenador" required>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Curso
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Cursos Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarCursos()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Sigla</th>
                    <th>Curso</th>
                    <th>Turno</th>
                    <th>Coordenador</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let c of listaCursos">
                    <td><span class="badge bg-secondary">{{ c.sigla }}</span></td>
                    <td class="fw-semibold">{{ c.descricao || c.nome }}</td>
                    <td><span class="badge bg-light text-dark border">{{ c.turno }}</span></td>
                    <td>{{ c.nomeCoordenador || 'Não informado' }}</td>
                    <td><span class="badge bg-success">{{ c.status || 'ATIVO' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 4: ESPAÇOS FÍSICOS -->
      <div *ngIf="abaAtiva === 'espaco'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-plus-circle text-primary me-1"></i> Novo Espaço Físico (RF 6.1)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarEspaco()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Centro Académico Vinculado</label>
                  <select class="form-select" [(ngModel)]="formEspaco.centroAcademicoId" name="espacoCa" required>
                    <option [ngValue]="null">Selecione o CA...</option>
                    <option *ngFor="let ca of listaCentros" [ngValue]="ca.id">
                      {{ ca.nome }}
                    </option>
                  </select>
                </div>
                <div class="row">
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Sigla / Código</label>
                    <input type="text" class="form-control" [(ngModel)]="formEspaco.sigla" name="siglaEspaco" placeholder="Ex: SALA-301" required>
                  </div>
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Tipo</label>
                    <select class="form-select" [(ngModel)]="formEspaco.tipo" name="tipoEspaco" required>
                      <option value="SALA">Sala de Aula</option>
                      <option value="AUDITORIO">Auditório</option>
                    </select>
                  </div>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome do Espaço</label>
                  <input type="text" class="form-control" [(ngModel)]="formEspaco.nome" name="nomeEspaco" placeholder="Ex: Sala 301 - Bloco C" required>
                </div>
                <div class="row">
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Capacidade Máxima</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="formEspaco.capacidadeMaxima" name="capEspaco" required>
                  </div>
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Localização</label>
                    <input type="text" class="form-control" [(ngModel)]="formEspaco.localizacao" name="locEspaco" placeholder="Ex: Bloco A, 2º Andar" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Descrição Complementar</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="formEspaco.descricaoComplementar" name="descComp" placeholder="Ex: Climatizada com projetor HDMI"></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Espaço Físico
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Espaços Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarEspacos()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Sigla</th>
                    <th>Espaço</th>
                    <th>Tipo</th>
                    <th>Capacidade</th>
                    <th>Localização</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let e of listaEspacos">
                    <td><span class="badge bg-secondary">{{ e.sigla }}</span></td>
                    <td class="fw-semibold">{{ e.nome }}</td>
                    <td><span class="badge bg-light text-dark border">{{ e.tipo }}</span></td>
                    <td>{{ e.capacidadeMaxima }} lugares</td>
                    <td>{{ e.localizacao }}</td>
                    <td><span class="badge bg-success">{{ e.status || e.statusOperacional || 'DISPONIVEL' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 5: LABORATÓRIOS -->
      <div *ngIf="abaAtiva === 'lab'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-cpu text-primary me-1"></i> Novo Laboratório de Informática (RF 6.1.2)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarLaboratorio()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Centro Académico Vinculado</label>
                  <select class="form-select" [(ngModel)]="formLab.centroAcademicoId" name="labCa" required>
                    <option [ngValue]="null">Selecione o CA...</option>
                    <option *ngFor="let ca of listaCentros" [ngValue]="ca.id">
                      {{ ca.nome }}
                    </option>
                  </select>
                </div>
                <div class="row">
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Sigla / Código</label>
                    <input type="text" class="form-control" [(ngModel)]="formLab.sigla" name="siglaLab" placeholder="Ex: LAB-02" required>
                  </div>
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Capacidade</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="formLab.capacidadeMaxima" name="capLab" required>
                  </div>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome do Laboratório</label>
                  <input type="text" class="form-control" [(ngModel)]="formLab.nome" name="nomeLab" placeholder="Ex: Laboratório de Redes e Sistemas" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Especificação dos Computadores (Hardware)</label>
                  <input type="text" class="form-control" [(ngModel)]="formLab.tipoComputadores" name="tipoPC" placeholder="Ex: Dell OptiPlex Core i7, 16GB RAM, SSD NVMe" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Localização</label>
                  <input type="text" class="form-control" [(ngModel)]="formLab.localizacao" name="locLab" placeholder="Ex: Pavilhão Tecnológico, Térreo" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Descrição Complementar</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="formLab.descricaoComplementar" name="descCompLab" placeholder="Ex: Bancadas com conexões Gigabit dedicadas"></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Laboratório
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Laboratórios Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarLaboratorios()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Sigla</th>
                    <th>Laboratório</th>
                    <th>Especificação Hardware</th>
                    <th>Capacidade</th>
                    <th>Localização</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let lab of listaLabs">
                    <td><span class="badge bg-secondary">{{ lab.sigla }}</span></td>
                    <td class="fw-semibold">{{ lab.nome }}</td>
                    <td><small class="text-muted"><i class="bi bi-pc me-1"></i>{{ lab.tipoComputadores }}</small></td>
                    <td>{{ lab.capacidadeMaxima }} lugares</td>
                    <td>{{ lab.localizacao }}</td>
                    <td><span class="badge bg-success">{{ lab.status || lab.statusOperacional || 'DISPONIVEL' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 6: UTILIZADORES & DOCENTES -->
      <div *ngIf="abaAtiva === 'usuario'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-person-plus text-primary me-1"></i> Novo Utilizador / Docente (RF 3)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarUsuario()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Centro Académico Vinculado</label>
                  <select class="form-select" [(ngModel)]="formUsuario.centroAcademicoId" name="usuarioCa" required>
                    <option [ngValue]="null">Selecione o CA...</option>
                    <option *ngFor="let ca of listaCentros" [ngValue]="ca.id">
                      {{ ca.nome }}
                    </option>
                  </select>
                </div>
                <div class="row">
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Matrícula / Registo</label>
                    <input type="text" class="form-control" [(ngModel)]="formUsuario.matricula" name="matrUser" placeholder="Ex: DOC-2026-01" required>
                  </div>
                  <div class="col-6 mb-2">
                    <label class="form-label small fw-semibold">Telefone</label>
                    <input type="text" class="form-control" [(ngModel)]="formUsuario.telefone" name="telUser" placeholder="(71) 98888-7777" required>
                  </div>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome Completo</label>
                  <input type="text" class="form-control" [(ngModel)]="formUsuario.nomeCompleto" name="nomeUser" placeholder="Ex: Prof. Carlos Eduardo Souza" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">E-mail Institucional</label>
                  <input type="email" class="form-control" [(ngModel)]="formUsuario.email" name="emailUser" placeholder="carlos.souza@ies.br" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Palavra-passe Inicial</label>
                  <input type="password" class="form-control" [(ngModel)]="formUsuario.senha" name="senhaUser" placeholder="Mínimo de 6 caracteres" required>
                </div>

                <div class="border rounded p-2 bg-light mb-3">
                  <label class="form-label small fw-semibold mb-2 d-block">
                    <i class="bi bi-shield-lock me-1"></i> Perfis de Acesso (RBAC)
                  </label>
                  <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="chkColaborador"
                          [checked]="temPerfil('COLABORADOR')"
                          (change)="togglePerfil('COLABORADOR')">
                    <label class="form-check-label small" for="chkColaborador">COLABORADOR</label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="chkUsuario"
                          [checked]="temPerfil('USUARIO')"
                          (change)="togglePerfil('USUARIO')">
                    <label class="form-check-label small" for="chkUsuario">USUARIO</label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="chkAdmin"
                          [checked]="temPerfil('ADMINISTRADOR')"
                          (change)="togglePerfil('ADMINISTRADOR')">
                    <label class="form-check-label small" for="chkAdmin">ADMINISTRADOR</label>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Utilizador
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Utilizadores & Docentes Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarUsuarios()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfis</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let u of listaUsuarios">
                    <td><span class="badge bg-secondary">{{ u.matricula || '-' }}</span></td>
                    <td class="fw-semibold">{{ u.nomeCompleto || u.nome }}</td>
                    <td>{{ u.email }}</td>
                    <td>
                      <span *ngFor="let p of u.perfis" class="badge bg-light text-primary border me-1">{{ p }}</span>
                    </td>
                    <td><span class="badge bg-success">{{ u.status || 'ATIVO' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 7: SOFTWARES & LICENÇAS -->
      <div *ngIf="abaAtiva === 'software'" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-plus-circle text-primary me-1"></i> Novo Software (RF 11)
            </div>
            <div class="card-body">
              <form (ngSubmit)="salvarSoftware()">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Nome do Software / Pacote</label>
                  <input type="text" class="form-control" [(ngModel)]="formSoftware.nome" name="nomeSw" placeholder="Ex: IntelliJ IDEA Ultimate, PostgreSQL" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Tipo de Licenciamento</label>
                  <select class="form-select" [(ngModel)]="formSoftware.tipo" name="tipoSw" required>
                    <option value="SOFTWARE_LIVRE">Software Livre / Código Aberto</option>
                    <option value="PROPRIETARIO">Proprietário / Comercial</option>
                  </select>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">URL Oficial de Download</label>
                  <input type="url" class="form-control" [(ngModel)]="formSoftware.urlDownload" name="urlSw" placeholder="https://www.jetbrains.com/idea/download" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Objetivo de Uso Pedagógico</label>
                  <input type="text" class="form-control" [(ngModel)]="formSoftware.objetivoUso" name="objSw" placeholder="Ex: Ambiente de desenvolvimento para POO e Spring Boot" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Disciplinas Vinculadas (Opcional)</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="formSoftware.disciplinasVinculadas" name="discSw" placeholder="Ex: Programação Orientada a Objetos, Sistemas Distribuídos"></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span> Salvar Software
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span><i class="bi bi-list-ul me-1"></i> Catálogo de Softwares Registados</span>
              <button class="btn btn-sm btn-outline-secondary" (click)="carregarSoftwares()"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Nome</th>
                    <th>Licença</th>
                    <th>Objetivo de Uso</th>
                    <th>Download</th>
                    <th>Disciplinas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let s of listaSoftwares">
                    <td class="fw-semibold">{{ s.nome }}</td>
                    <td>
                      <span class="badge" [ngClass]="s.tipo === 'SOFTWARE_LIVRE' ? 'bg-info text-dark' : 'bg-warning text-dark'">
                        {{ s.tipo === 'SOFTWARE_LIVRE' ? 'Software Livre' : 'Proprietário' }}
                      </span>
                    </td>
                    <td>{{ s.objetivoUso }}</td>
                    <td>
                      <a [href]="s.urlDownload" target="_blank" class="btn btn-sm btn-outline-primary py-0 px-1 text-decoration-none" title="Download">
                        <i class="bi bi-box-arrow-up-right"></i> Link
                      </a>
                    </td>
                    <td><small class="text-muted">{{ s.disciplinasVinculadas || 'Geral' }}</small></td>
                    <td><span class="badge bg-success">{{ s.status || 'ATIVO' }}</span></td>
                  </tr>
                  <tr *ngIf="listaSoftwares.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">Nenhum software registado no catálogo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
            <!-- ================= ABA 8: LOGS DE AUDITORIA (RF 4) ================= -->
      <div *ngIf="abaAtiva === 'logs'" class="card shadow-sm border-0">
        <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
          <span>
            <i class="bi bi-shield-check me-1 text-primary"></i>
            Monitorização de Logs de Auditoria e Rastreabilidade (RF 4)
          </span>
          <button class="btn btn-outline-primary btn-sm" (click)="carregarLogs()">
            <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small">
                <tr>
                  <th>ID</th>
                  <th>Data & Horário</th>
                  <th>Responsável / Utilizador</th>
                  <th>Ação Realizada</th>
                  <th>Detalhes / Recurso</th>
                </tr>
              </thead>
                <tbody class="small">
          <tr *ngFor="let log of listaLogs">
            <td class="fw-bold">#{{ log.id }}</td>

            <!-- 1. Data e Horário Formatados -->
            <td>{{ log.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</td>

            <!-- 2. Responsável e Matrícula -->
            <td>
              <span class="fw-semibold">{{ log.usuarioNome || 'Sistema' }}</span>
              <span *ngIf="log.matricula" class="badge bg-light text-secondary border ms-1">
                {{ log.matricula }}
              </span>
            </td>

            <!-- 3. Ação Colorida e Nítida (Verde, Azul, Amarelo ou Vermelho) -->
            <td>
              <span class="badge py-1 px-2" [ngClass]="{
                'bg-success text-white': log.acao?.includes('CADAST') || log.acao?.includes('CRIAR'),
                'bg-primary text-white': log.acao?.includes('APROV') || log.acao?.includes('FINALIZ'),
                'bg-warning text-dark': log.acao?.includes('EDIT') || log.acao?.includes('ATUALIZ'),
                'bg-danger text-white': log.acao?.includes('REPROV') || log.acao?.includes('INATIV'),
                'bg-secondary text-white': !log.acao?.includes('CADAST') && !log.acao?.includes('APROV') && !log.acao?.includes('REPROV')
              }">
                {{ log.acao }}
              </span>
            </td>

            <!-- 4. Entidade / Recurso Afetado (Pega direto o campo 'entidade' do JSON) -->
            <td>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-box me-1 text-primary"></i>{{ log.entidade }}
              </span>
            </td>
          </tr>

          <tr *ngIf="listaLogs.length === 0">
            <td colspan="5" class="text-center text-muted py-4">
              Nenhum registo de auditoria encontrado.
            </td>
          </tr>
        </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CadastrosComponent implements OnInit {
  abaAtiva: 'ies' | 'ca' | 'curso' | 'espaco' | 'lab' | 'usuario' | 'software' | 'logs' = 'ies';
  loading = false;
  mensagemSucesso = '';
  mensagemErro = '';

  listaIes: any[] = [];
  listaCentros: any[] = [];
  listaCursos: any[] = [];
  listaEspacos: any[] = [];
  listaLabs: any[] = [];
  listaUsuarios: any[] = [];
  listaSoftwares: any[] = [];
  listaLogs: any[] = [];

  formIes = {
    sigla: '',
    nome: '',
    emailCentral: '',
    telefoneCentral: '',
    nomeReitor: '',
    proReitorias: [] as any[]
  };

  novaProReitoria = {
    nome: '',
    nomeResponsavel: ''
  };

  formCentro = {
    iesId: null as number | null,
    nome: '',
    emailCentral: '',
    telefoneCentral: '',
    nomeCoordenador: ''
  };

  formCurso = {
    centroAcademicoId: null as number | null,
    sigla: '',
    descricao: '',
    turno: 'MATUTINO',
    nomeCoordenador: ''
  };

  formEspaco = {
    centroAcademicoId: null as number | null,
    sigla: '',
    nome: '',
    tipo: 'SALA',
    capacidadeMaxima: 40,
    localizacao: '',
    descricaoComplementar: ''
  };

  formLab = {
    centroAcademicoId: null as number | null,
    sigla: '',
    nome: '',
    capacidadeMaxima: 35,
    localizacao: '',
    tipoComputadores: '',
    descricaoComplementar: ''
  };

  formUsuario = {
    matricula: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    senha: '',
    centroAcademicoId: null as number | null,
    perfis: [] as string[]
  };

  formSoftware = {
    nome: '',
    urlDownload: '',
    tipo: 'SOFTWARE_LIVRE',
    objetivoUso: '',
    disciplinasVinculadas: ''
  };

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.carregarIes();
    this.carregarCentros();
    this.carregarCursos();
    this.carregarEspacos();
    this.carregarLaboratorios();
    this.carregarUsuarios();
    this.carregarSoftwares();
    this.carregarLogs();
  }

  // --- IES ---
  carregarIes(): void {
    this.http.get<any[]>(`${this.baseUrl}/ies`).subscribe({
      next: (res) => this.listaIes = res,
      error: () => {}
    });
  }

  salvarIes(): void {
    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.http.post(`${this.baseUrl}/ies`, this.formIes).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'IES registada com sucesso!';
        this.formIes = { sigla: '', nome: '', emailCentral: '', telefoneCentral: '', nomeReitor: '', proReitorias: [] };
        this.carregarIes();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar IES.';
      }
    });
  }

  adicionarProReitoria(): void {
    if (!this.novaProReitoria.nome || !this.novaProReitoria.nomeResponsavel) {
      this.mensagemErro = 'Preencha o nome da Pró-Reitoria e do responsável.';
      return;
    }
    this.formIes.proReitorias.push({ ...this.novaProReitoria });
    this.novaProReitoria = { nome: '', nomeResponsavel: '' };
    this.mensagemErro = '';
  }

  removerProReitoria(index: number): void {
    this.formIes.proReitorias.splice(index, 1);
  }

  // --- CENTROS ACADÉMICOS ---
  carregarCentros(): void {
    this.http.get<any[]>(`${this.baseUrl}/centros-academicos`).subscribe({
      next: (res) => this.listaCentros = res,
      error: () => {}
    });
  }

  salvarCentro(): void {
    if (!this.formCentro.iesId) {
      this.mensagemErro = 'Selecione obrigatoriamente a IES vinculada.';
      return;
    }

    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.http.post(`${this.baseUrl}/centros-academicos`, this.formCentro).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Centro Académico registado com sucesso!';
        this.formCentro = { iesId: null, nome: '', emailCentral: '', telefoneCentral: '', nomeCoordenador: '' };
        this.carregarCentros();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Centro Académico.';
      }
    });
  }

  // --- CURSOS ---
  carregarCursos(): void {
    this.http.get<any[]>(`${this.baseUrl}/cursos`).subscribe({
      next: (res) => this.listaCursos = res,
      error: () => {}
    });
  }

  salvarCurso(): void {
    if (!this.formCurso.centroAcademicoId) {
      this.mensagemErro = 'Selecione o Centro Académico.';
      return;
    }

    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.http.post(`${this.baseUrl}/cursos`, this.formCurso).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Curso registado com sucesso!';
        this.formCurso = {
          centroAcademicoId: null,
          sigla: '',
          descricao: '',
          turno: 'MATUTINO',
          nomeCoordenador: ''
        };
        this.carregarCursos();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Curso.';
      }
    });
  }

  // --- ESPAÇOS CONVENCIONAIS ---
  carregarEspacos(): void {
    this.http.get<any[]>(`${this.baseUrl}/espacos-academicos`).subscribe({
      next: (res) => this.listaEspacos = res,
      error: () => {}
    });
  }

  salvarEspaco(): void {
    if (!this.formEspaco.centroAcademicoId) {
      this.mensagemErro = 'Selecione o Centro Académico vinculado ao espaço.';
      return;
    }

    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const payload = {
      ...this.formEspaco,
      capacidadeMaxima: Number(this.formEspaco.capacidadeMaxima),
      centroAcademicoId: Number(this.formEspaco.centroAcademicoId)
    };

    this.http.post(`${this.baseUrl}/espacos-academicos`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Espaço Académico registado com sucesso!';
        this.formEspaco = {
          centroAcademicoId: null,
          sigla: '',
          nome: '',
          tipo: 'SALA',
          capacidadeMaxima: 40,
          localizacao: '',
          descricaoComplementar: ''
        };
        this.carregarEspacos();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Espaço Académico.';
      }
    });
  }

  // --- LABORATÓRIOS ---
  carregarLaboratorios(): void {
    this.http.get<any[]>(`${this.baseUrl}/laboratorios`).subscribe({
      next: (res) => this.listaLabs = res,
      error: () => {}
    });
  }

  salvarLaboratorio(): void {
    if (!this.formLab.centroAcademicoId) {
      this.mensagemErro = 'Selecione o Centro Académico vinculado ao laboratório.';
      return;
    }

    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const payload = {
      sigla: this.formLab.sigla,
      nome: this.formLab.nome,
      descricaoComplementar: this.formLab.descricaoComplementar,
      capacidadeMaxima: Number(this.formLab.capacidadeMaxima),
      localizacao: this.formLab.localizacao,
      tipoComputadores: this.formLab.tipoComputadores,
      centroAcademicoId: Number(this.formLab.centroAcademicoId)
    };

    this.http.post(`${this.baseUrl}/laboratorios`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Laboratório de Informática registado com sucesso!';
        this.formLab = {
          centroAcademicoId: null,
          sigla: '',
          nome: '',
          capacidadeMaxima: 35,
          localizacao: '',
          tipoComputadores: '',
          descricaoComplementar: ''
        };
        this.carregarLaboratorios();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Laboratório.';
      }
    });
  }

  // --- UTILIZADORES & DOCENTES ---
  carregarUsuarios(): void {
    this.http.get<any[]>(`${this.baseUrl}/usuarios`).subscribe({
      next: (res) => this.listaUsuarios = res,
      error: () => {}
    });
  }

  temPerfil(perfil: string): boolean {
    return this.formUsuario.perfis.includes(perfil);
  }

  togglePerfil(perfil: string): void {
    const idx = this.formUsuario.perfis.indexOf(perfil);
    if (idx > -1) {
      this.formUsuario.perfis.splice(idx, 1); // Remove normalmente sem restrição de tamanho
    } else {
      this.formUsuario.perfis.push(perfil);
    }
  }

  salvarUsuario(): void {
    if (!this.formUsuario.centroAcademicoId) {
      this.mensagemErro = 'Selecione o Centro Académico ao qual o utilizador/docente pertence.';
      return;
    }
    if (this.formUsuario.perfis.length === 0) {
      this.mensagemErro = 'Selecione pelo menos um perfil de acesso.';
      return;
    }

    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const payload = {
      matricula: this.formUsuario.matricula,
      nomeCompleto: this.formUsuario.nomeCompleto,
      email: this.formUsuario.email,
      telefone: this.formUsuario.telefone,
      senha: this.formUsuario.senha,
      centroAcademicoId: Number(this.formUsuario.centroAcademicoId),
      perfis: this.formUsuario.perfis
    };

    this.http.post(`${this.baseUrl}/usuarios`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Utilizador registado com sucesso!';
        this.formUsuario = {
          matricula: '',
          nomeCompleto: '',
          email: '',
          telefone: '',
          senha: '',
          centroAcademicoId: null,
          perfis: []
        };
        this.carregarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Utilizador.';
      }
    });
  }

  // --- SOFTWARES & LICENÇAS ---
  carregarSoftwares(): void {
    this.http.get<any[]>(`${this.baseUrl}/softwares`).subscribe({
      next: (res) => this.listaSoftwares = res,
      error: () => {}
    });
  }

  salvarSoftware(): void {
    this.loading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.http.post(`${this.baseUrl}/softwares`, this.formSoftware).subscribe({
      next: () => {
        this.loading = false;
        this.mensagemSucesso = 'Software registado no catálogo com sucesso!';
        this.formSoftware = {
          nome: '',
          urlDownload: '',
          tipo: 'SOFTWARE_LIVRE',
          objetivoUso: '',
          disciplinasVinculadas: ''
        };
        this.carregarSoftwares();
      },
      error: (err: any) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || err.error?.mensagem || 'Erro ao registar Software.';
      }
    });
  }

  carregarLogs(): void {
    this.http.get<any[]>(`${this.baseUrl}/logs`).subscribe({
      next: (res) => {
        this.listaLogs = res;
      },
      error: (err) => {
        console.error('Erro ao carregar logs de auditoria:', err);
      }
    });
  }

  getBadgeClass(acao: string): string {
    if (!acao) return 'bg-secondary text-white';
    const a = acao.toUpperCase();
    if (a.includes('CADAST') || a.includes('CRIAR') || a.includes('INSER')) return 'bg-success text-white';
    if (a.includes('APROV') || a.includes('FINALIZ')) return 'bg-primary text-white';
    if (a.includes('EDIT') || a.includes('ATUALIZ')) return 'bg-warning text-dark';
    if (a.includes('REPROV') || a.includes('INATIV') || a.includes('CANCEL') || a.includes('EXCLU')) return 'bg-danger text-white';
    return 'bg-secondary text-white';
  }
}
