import { TestBed } from '@angular/core/testing';

import { NetworkInputParserService } from './network-input-parser.service';

describe('NetworkInputParserService', () => {
  let service: NetworkInputParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkInputParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
