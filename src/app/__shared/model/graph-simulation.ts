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

export type Drag = { tag: 'drag' };
export type AddNode = { tag: 'addNode' };
export type AddEdge = { tag: 'addEdge'; weight: number };
export type Mode = Drag | AddNode | AddEdge;

export class GraphSimulation<N extends Node, E extends Edge<N>> {
  private mode: Mode;
  private graph: Graph<N, E>;
  private svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  color: d3.ScaleOrdinal<string, string>;
  edges: d3.Selection<
    Element | d3.EnterElement | Document | Window | SVGGElement,
    E,
    SVGGElement,
    any
  >;
  marker: d3.Selection<SVGPathElement, any, HTMLElement, any>;
  lines: d3.Selection<SVGLineElement, E, SVGGElement, any>;
  nodes: d3.Selection<
    Element | d3.EnterElement | Document | Window | SVGGElement,
    N,
    SVGGElement,
    any
  >;
  circles: d3.Selection<SVGCircleElement, N, SVGGElement, any>;
  simulation: d3.Simulation<N, undefined>;

  constructor(graph: Graph<N, E>) {
    this.graph = graph;
    this.mode = { tag: 'drag' };

    this.svg = d3
      .select<SVGElement, any>('svg')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.color = d3
      .scaleOrdinal<string, string>()
      .range(['#93c464', '#c3073f', '#5e88a2', '#ffb142']);

    this.edges = this.svg
      .append('g')
      .attr('id', 'gEdges')
      .selectAll('g')
      .data(this.graph.getEdges())
      .join('g')
      .attr('class', 'edge');

    this.marker = this.svg
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

    this.lines = this.edges
      .append('line')
      .join('line')
      .attr('marker-end', 'url(#arrow)');

    let ctx = this;

    this.nodes = this.svg
      .append('g')
      .attr('id', 'gNodes')
      .selectAll('g')
      .data(graph.getNodes())
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGCircleElement, N>()
          .on('start', (node) => {
            ctx.simulation.alphaTarget(0.6).restart();

            node.x = node.x;
            node.y = node.y;
          })
          .on('drag', (node) => {
            node.fx = adjustX(d3.event.x);
            node.fy = adjustY(d3.event.y);
          })
          .on('end', (node) => {
            ctx.simulation.alphaTarget(0.0);

            node.fx = null;
            node.fy = null;
          })
      )
      .on('mouseover', function () {
        d3.select(this)
          .select('circle')
          .transition('r')
          .attr('r', nodeRadiusOnFocus);
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').transition('r').attr('r', nodeRadius);
      });

    this.circles = this.nodes
      .append('circle')
      .join('circle')
      .attr('r', nodeRadius);

    this.svg.on('mousedown', function () {
      ctx.simulation.stop();
      // let p = d3.mouse(this);
      // data.nodes.push({
      //   id: '199',
      //   x: p[0],
      //   y: p[1],
      // });
      // here we basically need to feed all of the nodes into simulation once again!

      ctx.simulation.restart();
    });

    // let's see how long it takes my to configure the simulation..
    this.simulation = d3
      .forceSimulation<N, E>(graph.getNodes())
      .force('center', d3.forceCenter<N>(width / 2, height / 2))
      .force(
        'link',
        d3.forceLink<N, E>(graph.getEdges()).id((node) => node.id)
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
