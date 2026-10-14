import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Asset, AssetPayload } from './asset.model';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetForm {
  /** Asset being edited; `null` means a new asset. */
  readonly asset = input<Asset | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly saved = output<AssetPayload>();
  readonly cancelled = output<void>();

  protected readonly isEdit = computed(() => this.asset() !== null);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(30)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['', [Validators.required, Validators.maxLength(60)]],
    serialNumber: ['', Validators.maxLength(60)],
    dailyRate: [0, [Validators.required, Validators.min(0)]],
    acquisitionDate: [''],
  });

  constructor() {
    // Bridge signal -> imperative forms API: whenever the input changes, reset the form.
    effect(() => {
      const asset = this.asset();
      this.form.reset({
        code: asset?.code ?? '',
        name: asset?.name ?? '',
        category: asset?.category ?? '',
        serialNumber: asset?.serialNumber ?? '',
        dailyRate: asset?.dailyRate ?? 0,
        acquisitionDate: asset?.acquisitionDate ?? '',
      });
      if (asset) this.form.controls.code.disable();
      else this.form.controls.code.enable();
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      code: value.code,
      name: value.name,
      category: value.category,
      serialNumber: value.serialNumber || null,
      dailyRate: Number(value.dailyRate),
      acquisitionDate: value.acquisitionDate || null,
    });
  }

  protected invalid(control: 'code' | 'name' | 'category' | 'dailyRate'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
