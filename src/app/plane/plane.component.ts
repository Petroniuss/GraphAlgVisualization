import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Edge, Node, Graph } from '../__shared/model/graph';
import { NetworkInputParserService } from '../__shared/network-input-parser.service';
import { GraphSimulation } from '../__shared/model/graph-simulation';

@Component({
  selector: 'plane',
  templateUrl: './plane.component.html',
  styleUrls: ['./plane.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlaneComponent implements OnInit {
  private simulation: GraphSimulation<Node, Edge<Node>>;
  private readonly inputParser: NetworkInputParserService;

  constructor(inputParser: NetworkInputParserService) {
    this.inputParser = inputParser;
  }

  ngOnInit(): void {
    this.inputParser.fetchData().then((network) => {
      const graph = new Graph(network.nodes, network.links);
      this.simulation = new GraphSimulation(graph);
    });
  }
}
