import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// we might have classes that define more properties.
export interface Node extends SimulationNodeDatum {
  readonly id: string;
}

export interface Edge extends SimulationLinkDatum<Node> {
  readonly from: string;
  readonly to: string;
}

export interface NetworkInput {
  nodes: [Node];
  links: [Edge];
}

class GraphError extends Error {
  constructor(msg: string) {
    super('GraphError: ' + msg);
  }
}

export class Graph<N extends Node, E extends Edge> {
  private readonly adjMap: Map<string, [E]>;
  private readonly nodesMap: Map<string, N>;

  //   For some reason I cannot access `this`?!?!
  constructor() {
    this.adjMap = new Map<string, [E]>();
    this.nodesMap = new Map<string, N>();
  }

  public addNode(node: N): void {
    const key = node.id;
    // Sanity check
    if (this.nodesMap.has(key)) {
      throw new GraphError(`Graph already has node associated id: ${key}`);
    }

    this.nodesMap.set(key, node);
  }

  public addEdge(edge: E): void {
    const u = edge.from;
    const v = edge.to;

    // Sanity check
    if (!this.adjMap.has(u) || !this.adjMap.has(v)) {
      throw new GraphError(`Graph does not have given `);
    }

    let adjList = this.adjMap.get(u);

    // Sanity check
    if (!adjList.every((e) => edge.target === e.target)) {
      throw new GraphError(`Duplicate edge: ${edge.source}-${edge.target}! `);
    }

    adjList.push(edge);
  }

  public getNode(id: string): N {
    if (!this.nodesMap.has(id)) {
      throw new GraphError(`Accessing nonexistent node with id: ${id}!`);
    }

    return this.nodesMap.get(id);
  }
}