import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// we might want to define more properties.
export interface Node extends SimulationNodeDatum {
  readonly id: string;
}

export interface Edge<N extends Node> extends SimulationLinkDatum<N> {
  readonly from: string;
  readonly to: string;
}

export interface D3Network {
  nodes: Node[];
  links: Edge<Node>[];
}

class GraphError extends Error {
  constructor(msg: string) {
    super('GraphError: ' + msg);
  }
}

// we need another class that would manage simulation
export class Graph<N extends Node, E extends Edge<N>> {
  private readonly adjMap: Map<string, E[]>;
  private readonly nodesMap: Map<string, N>;
  private readonly nodes: N[];
  private readonly edges: E[];

  constructor(nodes: N[], edges: E[]) {
    this.adjMap = new Map<string, E[]>();
    this.nodesMap = new Map<string, N>();
    this.nodes = new Array<N>();
    this.edges = new Array<E>();

    nodes.forEach((n) => this.addNode(n));
    edges.forEach((e) => this.addEdge(e));
  }

  public addNode(node: N): void {
    const key = node.id;
    // Sanity check
    if (this.nodesMap.has(key)) {
      throw new GraphError(`Graph already has node associated id: ${key}`);
    }

    this.nodes.push(node);
    this.nodesMap.set(key, node);
    this.adjMap.set(key, new Array<E>());
  }

  public addEdge(edge: E): void {
    const u = edge.from;
    const v = edge.to;

    // Sanity check
    if (!this.adjMap.has(u) || !this.adjMap.has(v)) {
      throw new GraphError(`Graph does not have given nodes: ${u} or ${v}`);
    }

    let adjList = this.adjMap.get(u);

    // Sanity check
    if (!adjList.every((e) => edge.target !== e.target)) {
      throw new GraphError(`Duplicate edge: ${edge.source}-${edge.target}! `);
    }

    adjList.push(edge);
    this.edges.push(edge);
  }

  public hasNode(id: string): boolean {
    return this.nodesMap.has(id);
  }

  public hasEdge(from: N, to: N): boolean {
    if (!this.hasNode(from.id) || !this.hasNode(to.id)) return false;

    return this.adjMap.get(from.id).every((edge) => edge.to !== to.id);
  }

  public getNode(id: string): N {
    if (!this.hasNode(id)) {
      throw new GraphError(`Accessing nonexistent node with id: ${id}!`);
    }

    return this.nodesMap.get(id);
  }

  public getNodes(): N[] {
    return this.nodes;
  }

  public getEdges(): E[] {
    return this.edges;
  }

  public getEdgeNodes(edge: E): [N, N] {
    let u = edge.from,
      v = edge.to;

    return [this.nodesMap.get(u), this.nodesMap.get(v)];
  }
}
