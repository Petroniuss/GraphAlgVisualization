import { GraphMode, GraphLayout } from '../model/graph-layout';
import { Edge, Node } from '../model/graph';
import {
  height,
  width,
  adjustX,
  adjustY,
  nodeRadiusOnFocus,
  nodeRadius,
  collisionRadius,
} from '../model/simulation-configuration';
import * as d3 from 'd3';

export class DragMode<N extends Node, E extends Edge<N>>
  implements GraphMode<N, E> {
  apply(layout: GraphLayout<N, E>): void {
    let _markers = layout.defaultMarkersSelection();
    let edges = layout.defaultEdgesSelection();
    let lines = layout.defaultLinesSelection(edges);
    let nodes = layout.defaultNodesSelection();
    let circles = layout.defaultCirclesSelection(nodes);
    let ctx = {
      circles: circles,
      lines: lines,
    };
    let force = layout.defaultForceSimulation(ctx);

    nodes
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
    // this.svg.on('mousedown', function () {
    //   ctx.forceSimulation.stop();
    //   let p = d3.mouse(this);
    //   let node: N = initN(Math.random().toString(36).substring(7), p[0], p[1]);
    //   console.log(node);
    //   graph.addNode(node);
    //   ctx.nodes.data(graph.getNodes());
    //   // graph.k
    //   // here we basically need to feed all of the nodes into simulation once again!
    //   ctx.forceSimulation.restart();
    // });
  }
  play(): void {
    throw new Error('Method not implemented.');
  }
  exit(): void {
    throw new Error('Method not implemented.');
  }
}
