import { Component, OnInit } from '@angular/core';
import { EventService } from '../__shared/event.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private eventService;
  constructor(eventSerice: EventService) {
    this.eventService = this.eventService;
  }

  ngOnInit(): void {}

  selectDragMode(): void {}

  addNode(): void {
    console.log('Add node');
  }

  addEdge(weight: string): void {
    console.log(weight);
  }
}
