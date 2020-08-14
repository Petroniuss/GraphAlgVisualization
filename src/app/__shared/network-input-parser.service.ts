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
    return d3.json<InputData>(path).then((input) => this.toD3Network(input));
  }

  private toD3Network(input: InputData): D3Network {
    let nds = input.nodes.map(this.toNode);
    let egs = input.links.map(this.toEdge);

    return {
      nodes: nds,
      links: egs,
    };
  }

  private toNode(node: InputNode): Node {
    return { id: node.id.toString() };
  }

  private toEdge(link: InputLink): Edge {
    return {
      source: link.source,
      target: link.target,
      from: link.source.toString(),
      to: link.target.toString(),
    };
  }
}

interface InputNode {
  id: string | number;
}

interface InputLink {
  source: string | number;
  target: string | number;
}

interface InputData {
  nodes: [InputNode];
  links: [InputLink];
}
