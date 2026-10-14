import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ASSET_STATUS_LABELS, AssetStatus } from './asset.model';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="status().toLowerCase()">{{ label() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid currentColor;
    }
    .available { color: #1e8e3e; }
    .rented { color: #2457c5; }
    .maintenance { color: #b26a00; }
    .retired { color: #6b7280; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<AssetStatus>();
  protected readonly label = computed(() => ASSET_STATUS_LABELS[this.status()]);
}
