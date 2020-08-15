import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

import { Edge, Node, D3Network, Graph } from '../__shared/model';
import { NetworkInputParserService } from '../__shared/network-input-parser.service';
import {
  height,
  width,
  adjustX,
  adjustY,
  nodeRadiusOnFocus,
  nodeRadius,
  collisionRadius,
} from './view-configuration';

@Component({
  selector: 'plane',
  templateUrl: './plane.component.html',
  styleUrls: ['./plane.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlaneComponent implements OnInit {
  private readonly inputParser: NetworkInputParserService;

  private svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  private graph: Graph<Node, Edge>;

  constructor(inputParser: NetworkInputParserService) {
    this.inputParser = inputParser;
  }

  ngOnInit(): void {
    this.svg = d3
      .select<SVGElement, any>('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.inputParser.fetchData().then((network) => {
      this.graph = new Graph(network.nodes, network.links);
      this.createLayout(network);
    });
  }

  private createLayout(data: D3Network) {
    let color = d3
      .scaleOrdinal<string, string>()
      .range(['#93c464', '#c3073f', '#5e88a2', '#ffb142']);

    let edges = this.svg
      .append('g')
      .attr('id', 'gEdges')
      .selectAll('g')
      .data(data.links)
      .join('g')
      .attr('class', 'edge');

    let marker = this.svg
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

    let lines = edges
      .append('line')
      .join('line')
      .attr('marker-end', 'url(#arrow)');

    let nodes = this.svg
      .append('g')
      .attr('id', 'gNodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on('start', (node) => {
            if (!d3.event.active) {
              simulation.alphaTarget(0.6).restart();
            }

            node.fx = node.x;
            node.fy = node.y;
          })
          .on('drag', (node) => {
            node.fx = adjustX(d3.event.x);
            node.fy = adjustY(d3.event.y);
          })
          .on('end', (node) => {
            if (!d3.event.active) {
              simulation.alphaTarget(0.0);
            }

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

    let circles = nodes
      .append('circle')
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', (datum) => color(datum.id));

    // let's see how long it takes my to configure the simulation..
    let graph = this.graph;
    let simulation = d3
      .forceSimulation<Node, Edge>(data.nodes)
      .force('center', d3.forceCenter<Node>(width / 2, height / 2))
      .force(
        'link',
        d3.forceLink<Node, Edge>(data.links).id((node) => node.id)
      )
      .force('collision', d3.forceCollide<Node>(collisionRadius))
      .force('charge', d3.forceManyBody().strength(-100.0))
      .on('tick', function () {
        circles.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

        lines
          .attr('x1', (edge) => graph.getNode(edge.from).x)
          .attr('x2', (edge) => graph.getNode(edge.to).x)
          .attr('y1', (edge) => graph.getNode(edge.from).y)
          .attr('y2', (edge) => graph.getNode(edge.to).y);
      });

    simulation.alpha(1).restart();
  }
}
