import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Text input with two-way binding through `model()`: `[(value)]="term"`. */
@Component({
  selector: 'app-search-box',
  template: `
    <input
      type="search"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      [attr.aria-label]="placeholder()"
    />
  `,
  styles: `
    input { width: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBox {
  readonly value = model('');
  readonly placeholder = input('Search…');
}
