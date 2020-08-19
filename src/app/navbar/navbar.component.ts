import { Component, OnInit } from '@angular/core';
import { EventService } from '../__shared/event.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private eventService: EventService;
  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  ngOnInit(): void {}

  selectDragMode(): void {
    this.eventService.changeMode({
      tag: 'drag',
    });
  }

  selectCreateMode(): void {
    this.eventService.changeMode({
      tag: 'create',
      weight: 0,
    });
  }
}
