import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// we might have classes that define more properties.
export interface Node extends SimulationNodeDatum {
  readonly id: string;
}

export interface Edge extends SimulationLinkDatum<Node> {
  readonly from: string;
  readonly to: string;
}

export interface D3Network {
  nodes: Node[];
  links: Edge[];
}

class GraphError extends Error {
  constructor(msg: string) {
    super('GraphError: ' + msg);
  }
}

interface IdGen {
  next(validate: (string) => boolean): string;
}

class IdGenerator implements IdGen {
  private seed: number;
  constructor(seed: number = 0) {
    this.seed = seed;
  }

  next(validate: (string) => boolean): string {
    let nextId = this.seed.toString();
    while (!validate(nextId)) {
      this.seed += 1;
      nextId = this.seed.toString();
    }

    return nextId;
  }
}

// we need another class that would manage simulation
export class Graph<N extends Node, E extends Edge> {
  private readonly adjMap: Map<string, E[]>;
  private readonly nodesMap: Map<string, N>;
  private readonly idGenerator: IdGen;

  constructor(nodes: N[], edges: E[], idGenerator: IdGen = new IdGenerator()) {
    this.adjMap = new Map<string, E[]>();
    this.nodesMap = new Map<string, N>();
    this.idGenerator = idGenerator;

    nodes.forEach((n) => this.addNode(n));
    edges.forEach((e) => this.addEdge(e));
  }

  public addNode(node: N): void {
    const key = node.id;
    // Sanity check
    if (this.nodesMap.has(key)) {
      throw new GraphError(`Graph already has node associated id: ${key}`);
    }

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
  }

  public getNode(id: string): N {
    if (!this.nodesMap.has(id)) {
      throw new GraphError(`Accessing nonexistent node with id: ${id}!`);
    }

    return this.nodesMap.get(id);
  }

  public getEdgeNodes(edge: E): [N, N] {
    let u = edge.from,
      v = edge.to;

    return [this.nodesMap.get(u), this.nodesMap.get(v)];
  }
}
