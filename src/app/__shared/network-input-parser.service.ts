import { Injectable } from '@angular/core';
import { D3Network, Node, Edge } from './model';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class NetworkInputParserService {
  static readonly SIMPLE_NETWORK = 'assets/test_network_data.json';

  constructor() {}

  fetchData(
    path: string = NetworkInputParserService.SIMPLE_NETWORK
  ): Promise<D3Network> {
    return d3.json<InputData>(path).then((input) => input.toD3Network());
  }
}

class InputNode {
  id: string | number;

  toNode(): Node {
    return { id: this.id.toString() };
  }
}

class InputLink {
  source: string | number;
  target: string | number;

  toEdge(): Edge {
    return {
      source: this.source,
      target: this.target,
      from: this.source.toString(),
      to: this.target.toString(),
    };
  }
}

class InputData {
  nodes: [InputNode];
  links: [InputLink];

  toD3Network(): D3Network {
    let nds = this.nodes.map((n) => n.toNode());
    let egs = this.links.map((e) => e.toEdge());

    return {
      nodes: nds,
      links: egs,
    };
  }
}
