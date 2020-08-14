import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

import { Edge, Node, D3Network, Graph } from '../__shared/model';
import { NetworkInputParserService } from '../__shared/network-input-parser.service';

@Component({
  selector: 'plane',
  templateUrl: './plane.component.html',
  styleUrls: ['./plane.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlaneComponent implements OnInit {
  // These variables should probably be moved to some sort of config file.
  static readonly width = 600;
  static readonly height = 264;

  static readonly nodeRadius = 4;
  static readonly nodeRadiusOnFocus = 5;
  static readonly collisionRadius = PlaneComponent.nodeRadius;

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
      .attr('viewBox', `0 0 ${PlaneComponent.width} ${PlaneComponent.height}`);

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

    let lines = edges.append('line').join('line');

    let nodes = this.svg
      .append('g')
      .attr('id', 'gNodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node')
      .on('mouseover', function () {
        d3.select(this)
          .select('circle')
          .attr('r', PlaneComponent.nodeRadiusOnFocus);
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').attr('r', PlaneComponent.nodeRadius);
      });

    let circles = nodes
      .append('circle')
      .join('circle')
      .attr('r', PlaneComponent.nodeRadius)
      .attr('fill', (datum) => color(datum.id));

    // let's see how long it takes my to configure the simulation..
    let graph = this.graph;
    let simulation = d3
      .forceSimulation<Node, Edge>(data.nodes)
      .force(
        'center',
        d3.forceCenter<Node>(
          PlaneComponent.width / 2,
          PlaneComponent.height / 2
        )
      )
      .force(
        'link',
        d3.forceLink<Node, Edge>(data.links).id((node) => node.id)
      )
      .force('collision', d3.forceCollide<Node>(PlaneComponent.collisionRadius))
      .on('tick', function () {
        circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

        lines
          .attr('x1', (edge) => graph.getNode(edge.from).x)
          .attr('x2', (edge) => graph.getNode(edge.to).x)
          .attr('y1', (edge) => graph.getNode(edge.from).y)
          .attr('y2', (edge) => graph.getNode(edge.to).y);
      });

    simulation.alpha(1).restart();
  }
}
