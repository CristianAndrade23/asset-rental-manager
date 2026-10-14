import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AssetListPage, parseQuery } from './asset-list.page';
import { Asset, Page } from './asset.model';

function emptyPage(totalElements = 0): Page<Asset> {
  return { content: [], page: 0, size: 10, totalElements, totalPages: Math.ceil(totalElements / 10) };
}

describe('parseQuery', () => {
  it('maps the 1-based URL page and trims the search', () => {
    expect(parseQuery(' drill ', 'RENTED', '3')).toEqual({ search: 'drill', status: 'RENTED', page: 2 });
  });

  it('falls back to defaults for missing or invalid values', () => {
    expect(parseQuery(undefined, 'toString', '-1')).toEqual({ search: '', status: null, page: 0 });
    expect(parseQuery(undefined, 'BOGUS', 'abc')).toEqual({ search: '', status: null, page: 0 });
  });
});

describe('AssetListPage URL sync', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'assets', component: AssetListPage }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('applies filters from a deep link without waiting for the search debounce', async () => {
    await harness.navigateByUrl('/assets?q=drill&status=RENTED&page=2');

    // a single request, already filtered: no default fetch before the URL is applied
    const requests = http.match(() => true);
    expect(requests.map((r) => r.request.urlWithParams)).toEqual([
      '/api/assets?page=1&size=10&status=RENTED&search=drill',
    ]);
    requests[0].flush(emptyPage(25));
  });

  it('writes filter changes back to the URL', async () => {
    const page = await harness.navigateByUrl('/assets', AssetListPage);
    http.expectOne(() => true).flush(emptyPage(25));

    page['store'].setStatus('MAINTENANCE');
    await harness.fixture.whenStable();
    http.expectOne((r) => r.params.get('status') === 'MAINTENANCE').flush(emptyPage(25));

    expect(TestBed.inject(Router).url).toBe('/assets?status=MAINTENANCE');
  });
});
