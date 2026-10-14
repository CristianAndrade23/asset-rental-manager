import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Asset, Page } from './asset.model';
import { AssetStore } from './asset.store';

function page(content: Partial<Asset>[], pageIndex = 0, totalElements = content.length): Page<Asset> {
  return {
    content: content as Asset[],
    page: pageIndex,
    size: 10,
    totalElements,
    totalPages: Math.ceil(totalElements / 10),
  };
}

describe('AssetStore', () => {
  let store: AssetStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AssetStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the first page and derives the view state', () => {
    TestBed.tick();
    expect(store.loading()).toBe(true);

    http
      .expectOne((req) => req.url === '/api/assets' && req.params.get('page') === '0')
      .flush(page([{ id: 1, code: 'EXC-001' }], 0, 25));

    expect(store.loading()).toBe(false);
    expect(store.assets().length).toBe(1);
    expect(store.totalPages()).toBe(3);
    expect(store.hasNext()).toBe(true);
    expect(store.hasPrevious()).toBe(false);
    expect(store.rangeLabel()).toBe('1–1 of 25');
  });

  it('resets to the first page when the status filter changes', () => {
    TestBed.tick();
    http.expectOne(() => true).flush(page([{ id: 1 }], 0, 25));

    store.nextPage();
    TestBed.tick();
    http.expectOne((req) => req.params.get('page') === '1').flush(page([{ id: 2 }], 1, 25));

    store.setStatus('MAINTENANCE');
    TestBed.tick();
    const req = http.expectOne((r) => r.params.get('status') === 'MAINTENANCE');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(page([]));

    expect(store.isEmpty()).toBe(true);
  });

  it('restores filters immediately and ignores an echo of the current ones', () => {
    store.restore({ status: 'RENTED', search: 'drill', page: 2 });
    TestBed.tick();
    const req = http.expectOne(() => true);
    expect(req.request.params.get('search')).toBe('drill');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(page([], 2, 25));

    // the user keeps typing while the URL still holds the applied search
    store.setSearch('drill press');
    store.restore({ status: 'RENTED', search: 'drill', page: 0 });
    expect(store.search()).toBe('drill press');
    TestBed.tick();
    http.expectOne((r) => r.params.get('search') === 'drill').flush(page([], 0, 25));
  });

  it('exposes the API error message', () => {
    TestBed.tick();
    http
      .expectOne(() => true)
      .flush({ detail: 'Boom' }, { status: 500, statusText: 'Server Error' });

    expect(store.error()).toBe('Boom');
    expect(store.loading()).toBe(false);
  });
});
