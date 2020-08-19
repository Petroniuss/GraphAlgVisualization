import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Edge, Node, Graph } from '../__shared/model/graph';
import { NetworkInputParserService } from '../__shared/network-input-parser.service';
import { GraphLayout, GraphMode } from '../__shared/model/graph-layout';
import { DragMode } from '../__shared/mode/drag-mode';
import { CreateMode } from '../__shared/mode/create-mode';
import { EventService } from '../__shared/event.service';

@Component({
  selector: 'plane',
  templateUrl: './plane.component.html',
  styleUrls: ['./plane.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlaneComponent implements OnInit {
  private layout: GraphLayout<Node, Edge<Node>>;
  private mode: GraphMode<Node, Edge<Node>>;
  private readonly inputParser: NetworkInputParserService;

  constructor(
    inputParser: NetworkInputParserService,
    eventService: EventService
  ) {
    this.inputParser = inputParser;
    eventService.modeObservable().subscribe((mode) => {
      this.mode.exit();
      console.log(mode);
      switch (mode.tag) {
        case 'drag':
          this.mode = new DragMode();
          break;
        case 'create':
          this.mode = new CreateMode();
          break;
      }
      this.mode.apply(this.layout);
    });
  }

  ngOnInit(): void {
    this.inputParser.fetchData().then((network) => {
      const graph = new Graph(network.nodes, network.links);
      this.layout = new GraphLayout(graph);
      this.mode = new DragMode();

      this.mode.apply(this.layout);
    });
  }
}
