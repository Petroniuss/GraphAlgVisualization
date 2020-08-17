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

  // stops execution of given algorithm
  pause(): void;

  // should remove all event listeners
  exit(): void;
}

export class GraphLayout<N extends Node, E extends Edge<N>> {
  readonly graph: Graph<N, E>;
  readonly svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  nodesContainer: d3.Selection<SVGGElement, any, HTMLElement, any>;
  edgeContainer: d3.Selection<SVGGElement, any, HTMLElement, any>;

  constructor(graph: Graph<N, E>) {
    this.graph = graph;
    this.svg = d3
      .select<SVGElement, any>('svg')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.edgeContainer = this.svg.append('g').attr('id', 'gEdges');
    this.nodesContainer = this.svg.append('g').attr('id', 'gNodes');
    this.svg
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

  defaultBindEdges() {
    let edgeS = this.edgeContainer.selectAll('g').data(this.graph.getEdges());

    edgeS
      .enter()
      .append('g')
      .attr('class', 'edge')
      .append('line')
      .attr('marker-end', 'url(#arrow)');

    edgeS.exit().remove();
  }

  defaultBindNodes() {
    let nodeS = this.nodesContainer.selectAll('g').data(this.graph.getNodes());

    nodeS
      .enter()
      .append('g')
      .attr('class', 'node')
      .append('circle')
      .join('circle')
      .attr('r', nodeRadius);

    nodeS.exit().remove();
  }

  defaultEdgesSelection() {
    return this.edgeContainer.selectAll('g');
  }

  defaultLinesSelection() {
    return this.defaultEdgesSelection().select('line');
  }

  defaultNodesSelection() {
    return this.nodesContainer.selectAll('g');
  }

  defaultCirclesSelection() {
    return this.defaultNodesSelection().select('circle');
  }

  defaultMarkersSelection() {
    return this.svg.select('defs').select('marker');
  }

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
}
