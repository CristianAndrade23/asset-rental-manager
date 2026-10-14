import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset, AssetPayload, AssetQuery, AssetStatus, Page } from './asset.model';

@Injectable({ providedIn: 'root' })
export class AssetApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/assets';

  search(query: AssetQuery, size = 10): Observable<Page<Asset>> {
    let params = new HttpParams().set('page', query.page).set('size', size);
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<Page<Asset>>(this.baseUrl, { params });
  }

  create(payload: AssetPayload): Observable<Asset> {
    return this.http.post<Asset>(this.baseUrl, payload);
  }

  update(id: number, payload: Omit<AssetPayload, 'code'>): Observable<Asset> {
    return this.http.put<Asset>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: number, status: AssetStatus): Observable<Asset> {
    return this.http.patch<Asset>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
