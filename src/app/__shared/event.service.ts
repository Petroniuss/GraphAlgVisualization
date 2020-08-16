import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Mode } from './model/graph-simulation';

// We might think about creating interfaces that this service would
// implement so that it would be impossible for receiver to emit events.
@Injectable({
  providedIn: 'root',
})
export class EventService {
  private modeSource = new Subject<Mode>();
  private logSource = new Subject<string>();

  public changeMode(mode: Mode): void {
    this.modeSource.next(mode);
  }

  public modeObservable(): Observable<Mode> {
    return this.modeSource.asObservable();
  }

  public emitLog(log: string): void {
    this.logSource.next(log);
  }

  public logObservable(): Observable<string> {
    return this.logSource.asObservable();
  }
}
