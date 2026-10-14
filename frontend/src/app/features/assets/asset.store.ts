import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  scan,
  startWith,
  switchMap,
} from 'rxjs';
import { AssetApi } from './asset.api';
import { Asset, AssetPayload, AssetQuery, AssetStatus, Page } from './asset.model';

interface ListState {
  loading: boolean;
  error: string | null;
  data: Page<Asset> | null;
}

const INITIAL_STATE: ListState = { loading: true, error: null, data: null };

/**
 * Screen state for the asset list.
 * Signals hold the state; RxJS only handles the async flow (debounce + cancel stale requests).
 */
@Injectable()
export class AssetStore {
  private readonly api = inject(AssetApi);

  // --- filters (writable state) ---
  readonly status = signal<AssetStatus | null>(null);
  readonly search = signal('');
  readonly page = signal(0);
  private readonly reloadTick = signal(0);

  // --- mutation state ---
  readonly saving = signal(false);
  readonly mutationError = signal<string | null>(null);

  // Typing should not fire one request per key stroke.
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300),
      map((term) => term.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  private readonly query = computed<AssetQuery & { tick: number }>(() => ({
    status: this.status(),
    search: this.debouncedSearch(),
    page: this.page(),
    tick: this.reloadTick(),
  }));

  // switchMap cancels the previous request when the query changes.
  private readonly state = toSignal(
    toObservable(this.query).pipe(
      switchMap((query) => this.fetch(query)),
      // keep the previous page on screen while the next one loads
      scan((prev, next) => ({ ...prev, ...next }), INITIAL_STATE),
    ),
    { initialValue: INITIAL_STATE },
  );

  // --- derived state ---
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly assets = computed(() => this.state().data?.content ?? []);
  readonly totalElements = computed(() => this.state().data?.totalElements ?? 0);
  readonly totalPages = computed(() => this.state().data?.totalPages ?? 0);
  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() + 1 < this.totalPages());
  readonly isEmpty = computed(() => !this.loading() && !this.error() && this.assets().length === 0);
  readonly rangeLabel = computed(() => {
    const data = this.state().data;
    if (!data || data.totalElements === 0) return '';
    const from = data.page * data.size + 1;
    const to = from + data.content.length - 1;
    return `${from}–${to} of ${data.totalElements}`;
  });

  setStatus(status: AssetStatus | null): void {
    this.status.set(status);
    this.page.set(0);
  }

  setSearch(term: string): void {
    this.search.set(term);
    this.page.set(0);
  }

  nextPage(): void {
    if (this.hasNext()) this.page.update((p) => p + 1);
  }

  previousPage(): void {
    if (this.hasPrevious()) this.page.update((p) => p - 1);
  }

  refresh(): void {
    this.reloadTick.update((t) => t + 1);
  }

  create(payload: AssetPayload): Promise<boolean> {
    return this.mutate(this.api.create(payload));
  }

  update(id: number, payload: AssetPayload): Promise<boolean> {
    const { code: _code, ...details } = payload;
    return this.mutate(this.api.update(id, details));
  }

  changeStatus(asset: Asset, status: AssetStatus): Promise<boolean> {
    return this.mutate(this.api.changeStatus(asset.id, status));
  }

  async delete(asset: Asset): Promise<boolean> {
    const ok = await this.mutate(this.api.delete(asset.id));
    // removing the last row of the last page would leave an empty page
    if (ok && this.assets().length === 1 && this.hasPrevious()) this.previousPage();
    return ok;
  }

  clearMutationError(): void {
    this.mutationError.set(null);
  }

  private fetch(query: AssetQuery): Observable<Partial<ListState>> {
    return this.api.search(query).pipe(
      map((data) => ({ loading: false, error: null, data })),
      catchError((err: HttpErrorResponse) => of({ loading: false, error: describeError(err) })),
      startWith({ loading: true }),
    );
  }

  private async mutate(request: Observable<unknown>): Promise<boolean> {
    this.saving.set(true);
    this.mutationError.set(null);
    try {
      await firstValueFrom(request, { defaultValue: undefined });
      this.refresh();
      return true;
    } catch (err) {
      this.mutationError.set(describeError(err as HttpErrorResponse));
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}

function describeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Could not reach the server. Is the API running?';
  return err.error?.detail ?? err.message ?? 'Unexpected error';
}
