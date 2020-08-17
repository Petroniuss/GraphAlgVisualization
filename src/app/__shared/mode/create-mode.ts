import { GraphMode, GraphLayout } from '../model/graph-layout';
import { Edge, Node } from '../model/graph';
import {
  adjustX,
  adjustY,
  nodeRadiusOnFocus,
  nodeRadius,
} from '../model/simulation-configuration';
import * as d3 from 'd3';
import { Option, some, none } from 'fp-ts/Option';

// upon selecting two nodes edge shoudld be created between them and selection fill should
// should be animated back to default.

// upon pressing a mouse on the canvas new node should be created with newly generated id.
export class CreateMode<N extends Node, E extends Edge<N>>
  implements GraphMode<N, E> {
  nodes: any;
  force: d3.Simulation<N, E>;

  apply(layout: GraphLayout<N, E>): void {
    layout.defaultBindEdges();
    layout.defaultBindNodes();

    this.nodes = layout.defaultNodesSelection();
    let lines = layout.defaultLinesSelection();
    let circles = layout.defaultCirclesSelection();

    let ctx = {
      circles: circles,
      lines: lines,
    };

    this.force = layout.defaultForceSimulation(ctx);

    let force = this.force;
    this.nodes
      .call(
        d3
          .drag<SVGCircleElement, N>()
          .on('start', (node) => {
            force.alphaTarget(0.6).restart();
            node.x = node.x;
            node.y = node.y;
          })
          .on('drag', (node) => {
            node.fx = adjustX(d3.event.x);
            node.fy = adjustY(d3.event.y);
          })
          .on('end', (node) => {
            force.alphaTarget(0.0);
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
  }

  play(): void {}

  pause(): void {}

  exit(): void {
    this.force.stop();

    this.nodes
      .on('mousedown.drag', null)
      .on('mousedown.start', null)
      .on('mousedown.end', null)
      .on('mouseover', null)
      .on('mouseout', null);
  }

  mouseDownCanvas(): void {}

  mouseOverNode(): void {}

  mouseDownNode(): void {}

  restart(): void {
    let lines = this.layout.defaultLinesSelection();
    let;
  }
}
