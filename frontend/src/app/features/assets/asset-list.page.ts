import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, input, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchBox } from '../../shared/search-box';
import { AssetForm } from './asset-form';
import { ASSET_STATUS_LABELS, Asset, AssetPayload, AssetQuery, AssetStatus } from './asset.model';
import { AssetStore } from './asset.store';
import { StatusBadge } from './status-badge';

@Component({
  selector: 'app-asset-list-page',
  imports: [CurrencyPipe, SearchBox, AssetForm, StatusBadge],
  providers: [AssetStore],
  templateUrl: './asset-list.page.html',
  styleUrl: './asset-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetListPage implements OnInit {
  protected readonly store = inject(AssetStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly statusOptions = Object.entries(ASSET_STATUS_LABELS) as [AssetStatus, string][];

  // Query params, bound by withComponentInputBinding(): /assets?q=drill&status=RENTED&page=2
  readonly q = input<string>();
  readonly status = input<string>();
  readonly page = input<string>();

  /** `undefined` = form closed, `null` = creating, `Asset` = editing. */
  protected readonly editing = signal<Asset | null | undefined>(undefined);

  constructor() {
    // URL → store: deep links, refresh and the nav link (which clears the params).
    effect(() => this.syncFromUrl());

    // store → URL: replaceUrl keeps filter tweaks out of the browser history.
    effect(() => {
      const { status, search, page } = this.store.filters();
      untracked(() =>
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: search || null, status, page: page > 0 ? page + 1 : null },
          replaceUrl: true,
        }),
      );
    });
  }

  // Runs before the store's first request, so a deep link does not fetch the defaults first.
  ngOnInit(): void {
    this.syncFromUrl();
  }

  private syncFromUrl(): void {
    const query = parseQuery(this.q(), this.status(), this.page());
    untracked(() => this.store.restore(query));
  }

  protected openCreate(): void {
    this.store.clearMutationError();
    this.editing.set(null);
  }

  protected openEdit(asset: Asset): void {
    this.store.clearMutationError();
    this.editing.set(asset);
  }

  protected closeForm(): void {
    this.editing.set(undefined);
  }

  protected async save(payload: AssetPayload): Promise<void> {
    const current = this.editing();
    const ok = current ? await this.store.update(current.id, payload) : await this.store.create(payload);
    if (ok) this.closeForm();
  }

  protected toggleMaintenance(asset: Asset): void {
    this.store.changeStatus(asset, asset.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE');
  }

  protected remove(asset: Asset): void {
    if (confirm(`Delete asset ${asset.code}?`)) this.store.delete(asset);
  }

  protected onStatusFilter(value: string): void {
    this.store.setStatus(value ? (value as AssetStatus) : null);
  }
}

/** Turns raw query params into a valid query; unknown values fall back to the defaults. */
export function parseQuery(q?: string, status?: string, page?: string): AssetQuery {
  const pageNumber = Number(page);
  return {
    search: q?.trim() ?? '',
    status: status && Object.hasOwn(ASSET_STATUS_LABELS, status) ? (status as AssetStatus) : null,
    // the URL is 1-based for humans, the API is 0-based
    page: Number.isInteger(pageNumber) && pageNumber > 1 ? pageNumber - 1 : 0,
  };
}
