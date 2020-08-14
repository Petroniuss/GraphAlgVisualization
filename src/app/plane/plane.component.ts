import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

import { Edge, Node, NetworkInput, Graph } from '../__shared/model';
import { SimulationLinkDatum, SimulationNodeDatum, linkHorizontal } from 'd3';

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

  private svg: d3.Selection<SVGElement, any, HTMLElement, any>;
  private graph: Graph<Node, Edge>;

  constructor() {}

  ngOnInit(): void {
    this.svg = d3
      .select<SVGElement, any>('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${PlaneComponent.width} ${PlaneComponent.height}`);

    d3.json<NetworkInput>('assets/test_network_data.json').then((data) => {
      this.graph = new Graph<Node, Edge>();
      // Idk why this doesn't work..
      // data.nodes.forEach(this.graph.addNode);
      // data.links.forEach(this.graph.addEdge);

      this.createLayout(data);
    });
  }

  private createLayout(data: NetworkInput) {
    let color = d3
      .scaleOrdinal<string, string>()
      .range(['#93c464', '#c3073f', '#5e88a2', '#ffb142']);

    let graph = this.graph;

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

    let edges = this.svg
      .append('g')
      .attr('id', 'gEdges')
      .selectAll('g')
      .data(data.links)
      .join('g')
      .attr('class', 'edge');

    let lines = edges.append('line').join('line');

    // let's see how long it takes my to configure the simulation..
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
        // lines.attr('x1', (edge) => graph.getNode(edge.from).x);
      });

    simulation.alpha(1).restart();
  }

  // Okay ... This seems inefficient!
  // private createArcDiagram(nodes: any, edges: any): void {
  //   var nodeHash = {};

  //   nodes.forEach((node, i) => {
  //     nodeHash[node.id] = node;
  //     node.x = parseInt(i) * 30;
  //   });

  //   edges.forEach((edge) => {
  //     edge.weight = parseInt(edge.weight);
  //     edge.source = nodeHash[edge.source];
  //     edge.target = nodeHash[edge.target];
  //   });

  //   let arcG = this.svg.append('g').attr('id', 'arcG');

  //   console.log(edges);

  //   arcG
  //     .selectAll('path')
  //     .data(edges)
  //     .join('path')
  //     .attr('class', 'arc')
  //     .style('stroke-width', (d) => d.weight / 2)
  //     .attr('d', (d, _i) => {
  //       var draw = d3.line().curve(d3.curveBasis);
  //       var midX = (d.source.x + d.target.x + 40) / 2;
  //       var midY = d.source.x - d.target.x;

  //       return draw([
  //         [d.source.x + 20, d.source.x + 20],
  //         [midX, midY],
  //         [d.target.x + 20, d.target.x + d.target.x + 20],
  //       ]);
  //     });

  //   arcG
  //     .selectAll('circle')
  //     .data(nodes)
  //     .join('circle')
  //     .attr('class', 'node')
  //     .attr('r', 5)
  //     .attr('cx', (d) => d.x + 20)
  //     .attr('cy', (d) => d.x + 20)
  //     .each(function (d) {
  //       console.log(d, this);
  //     });

  //   d3.selectAll('circle')
  //     .on('mouseover', (d, i, g) => {
  //       console.log(d, i, g);
  //       d3.select(g[i]).classed('active', true);
  //     })
  //     .on('mouseout', (d, i, g) => {
  //       d3.select(g[i]).classed('active', false);
  //     });
  // }
}
