import { Edge, Node, Graph } from './graph';
import {
  height,
  width,
  adjustX,
  adjustY,
  nodeRadiusOnFocus,
  nodeRadius,
  collisionRadius,
} from './simulation-configuration';
import * as d3 from 'd3';

export type DragModeEvent = { tag: 'drag' };
export type AddNodeModeEvent = { tag: 'addNode' };
export type AddEdgeModeEvent = { tag: 'addEdge'; weight: number };
export type ModeEvent = DragEvent | AddNodeModeEvent | AddEdgeModeEvent;

export interface GraphMode<N extends Node, E extends Edge<N>> {
  // applies given mode: sets event listeners, possibly changes style and layout
  apply(layout: GraphLayout<N, E>): void;

  // should be called upon hitting play button - should start algorithm
  play(): void;

  // should remove all event listeners
  exit(): void;
}

export class GraphLayout<N extends Node, E extends Edge<N>> {
  readonly graph: Graph<N, E>;
  readonly svg: d3.Selection<SVGElement, any, HTMLElement, any>;

  defaultEdgesSelection() {
    return this.svg
      .append('g')
      .attr('id', 'gEdges')
      .selectAll('g')
      .data(this.graph.getEdges())
      .join('g')
      .attr('class', 'edge');
  }

  defaultLinesSelection(edgesSelection) {
    return edgesSelection
      .append('line')
      .join('line')
      .attr('marker-end', 'url(#arrow)');
  }

  defaultNodesSelection() {
    return this.svg
      .append('g')
      .attr('id', 'gNodes')
      .selectAll('g')
      .data(this.graph.getNodes())
      .join('g')
      .attr('class', 'node');
  }

  defaultCirclesSelection(nodesSelection) {
    return nodesSelection.append('circle').join('circle').attr('r', nodeRadius);
  }

  defaultMarkersSelection() {
    return this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('markerWidth', 8)
      .attr('markerHeight', 10)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 6 3 L 0 6 z');
  }

  // let's see how long it takes my to configure the simulation..
  // This is the easiest way to reuse implementation => pass context which contains selectoin of circles and lines.
  // Context needs to be updateed whenever we add nodes
  defaultForceSimulation(ctx: { circles; lines }) {
    let graph = this.graph;
    return d3
      .forceSimulation<N, E>(this.graph.getNodes())
      .force('center', d3.forceCenter<N>(width / 2, height / 2))
      .force(
        'link',
        d3.forceLink<N, E>(this.graph.getEdges()).id((node) => node.id)
      )
      .force('collision', d3.forceCollide<N>(collisionRadius))
      .force('charge', d3.forceManyBody().strength(-100.0).distanceMax(100.0))
      .on('tick', function () {
        ctx.circles.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
        ctx.lines
          .attr('x1', (edge) => graph.getNode(edge.from).x)
          .attr('x2', (edge) => graph.getNode(edge.to).x)
          .attr('y1', (edge) => graph.getNode(edge.from).y)
          .attr('y2', (edge) => graph.getNode(edge.to).y);
      });
  }

  constructor(graph: Graph<N, E>) {
    this.graph = graph;
    this.svg = d3
      .select<SVGElement, any>('svg')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${width} ${height}`);
  }
}
