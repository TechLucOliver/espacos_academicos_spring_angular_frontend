import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: { login: string; senha: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.API_URL, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Decodifica o payload do JWT para extrair roles e dados do usuário
  getPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson);
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const payload = this.getPayload();
    if (!payload) return [];

    // Tenta capturar a lista de permissões independentemente da claim gerada no backend
    const rawRoles = payload.roles || payload.perfis || payload.authorities || [];
    return Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.some(r => r === role || r === `ROLE_${role}`);
  }

  getUserLogin(): string {
    const payload = this.getPayload();
    return payload ? payload.sub || 'Usuário' : '';
  }

  getEmail(): string {
    return this.getUserLogin();
  }

  getUserNome(): string {
    const payload = this.getPayload();
    return payload ? payload.nome || '' : '';
  }

  getUserMatricula(): string {
    const payload = this.getPayload();
    return payload ? payload.matricula || '' : '';
  }

  getUserId(): number {
    const payload = this.getPayload();
    if (payload && payload.id) {
      return Number(payload.id);
    }
    return 0;
  }
}
