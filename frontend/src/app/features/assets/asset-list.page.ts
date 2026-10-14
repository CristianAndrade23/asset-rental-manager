import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SearchBox } from '../../shared/search-box';
import { AssetForm } from './asset-form';
import { ASSET_STATUS_LABELS, Asset, AssetPayload, AssetStatus } from './asset.model';
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
export class AssetListPage {
  protected readonly store = inject(AssetStore);
  protected readonly statusOptions = Object.entries(ASSET_STATUS_LABELS) as [AssetStatus, string][];

  /** `undefined` = form closed, `null` = creating, `Asset` = editing. */
  protected readonly editing = signal<Asset | null | undefined>(undefined);

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
