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
export class CreateMode implements GraphMode<Node, Edge<Node>> {
  nodes: any;
  force: d3.Simulation<Node, Edge<Node>>;
  layout: GraphLayout<Node, Edge<Node>>;
  idGenerator: IdGen;
  selectedNode: Option<Node> = none;

  apply(layout: GraphLayout<Node, Edge<Node>>): void {
    this.idGenerator = new IdGenerator(
      0,
      (id) => !this.layout.graph.hasNode(id)
    );
    this.layout = layout;
    this.bindEdges();
    this.bindNodes();

    this.nodes = layout.defaultNodesSelection();
    this.force = layout.defaultForceSimulation();

    let idGen = this.idGenerator;
    let graph = this.layout.graph;
    let force = this.force;
    let ctx = this;
    let mouseDownCanvas = function () {
      force.stop();
      let point = d3.mouse(this);
      let id = idGen.next();
      let node: Node = { x: point[0], y: point[1], id: id };

      graph.addNode(node);
      ctx.restart();
    };
    layout.defaultSvgSelection().on('mousedown', mouseDownCanvas);
  }

  restart() {
    this.bindEdges();
    this.bindNodes();
    this.force = this.layout.defaultForceSimulation();
  }

  bindEdges() {
    let edgeS = this.layout
      .defaultEdgesSelection()
      .data(this.layout.graph.getEdges());

    let graph = this.layout.graph;

    edgeS
      .enter()
      .append('g')
      .attr('id', (edge) => `e${edge.from}-${edge.to}`)
      .attr('class', 'edge')
      .append('line')
      .attr('marker-end', 'url(#arrow)')
      .attr('x1', (edge) => graph.getNode(edge.from).x)
      .attr('x2', (edge) => graph.getNode(edge.to).x)
      .attr('y1', (edge) => graph.getNode(edge.from).y)
      .attr('y2', (edge) => graph.getNode(edge.to).y);
    edgeS.exit().remove();

    this.layout.updateLines();
  }

  bindNodes() {
    let ctx = this;
    let graph = this.layout.graph;

    let nodeS = this.layout
      .defaultNodesSelection()
      .data(this.layout.graph.getNodes())
      .on('mousedown', (n) => {
        ctx.layout
          .getNodeSelectionById(n.id)
          .select('circle')
          .attr('fill', '#ffffff');

        switch (ctx.selectedNode._tag) {
          case 'Some':
            let n1 = ctx.selectedNode.value;
            if (n.id !== n1.id) {
              graph.addEdge({
                from: n1.id,
                to: n.id,
                source: n1,
                target: n,
              });
              ctx.restart();
            }
            ctx.selectedNode = none;
            break;
          case 'None':
            ctx.selectedNode = some(n);
            break;
        }
        d3.event.stopPropagation();
      })
      .on('mouseover', function () {
        d3.select(this)
          .select('circle')
          .transition('r')
          .attr('r', nodeRadiusOnFocus);
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').transition('r').attr('r', nodeRadius);
      });

    nodeS
      .enter()
      .append('g')
      .attr('id', (n) => n.id)
      .attr('class', 'node')
      .append('circle')
      .join('circle')
      .attr('r', nodeRadius)
      .on('mousedown', (n) => {
        ctx.layout
          .getNodeSelectionById(n.id)
          .select('circle')
          .attr('r', 15)
          .attr('fill', '#ffffff');

        switch (ctx.selectedNode._tag) {
          case 'Some':
            let n1 = ctx.selectedNode.value;
            if (n.id !== n1.id) {
              graph.addEdge({
                from: n1.id,
                to: n.id,
                source: n1,
                target: n,
              });
            }
            ctx.selectedNode = none;
            ctx.restart();
            break;
          case 'None':
            ctx.selectedNode = some(n);
            break;
        }
        d3.event.stopPropagation();
      })
      .on('mouseover', function () {
        d3.select(this)
          .select('circle')
          .transition('r')
          .attr('r', nodeRadiusOnFocus);
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').transition('r').attr('r', nodeRadius);
      });

    nodeS.exit().remove();

    this.layout.updateCircles();
  }

  play(): void {}

  pause(): void {}

  exit(): void {
    this.force.stop();
    this.layout.defaultSvgSelection().on('mousedown', null);

    this.nodes
      .on('mousedown.drag', null)
      .on('mousedown.start', null)
      .on('mousedown.end', null)
      .on('mouseover', null)
      .on('mouseout', null);
  }
}

interface IdGen {
  next(): string;
}

class IdGenerator implements IdGen {
  private seed: number;
  private validate: (string) => boolean;

  constructor(seed: number, validate: (string) => boolean) {
    this.seed = seed;
    this.validate = validate;
  }

  next(): string {
    let nextId = this.seed.toString();
    while (!this.validate(nextId)) {
      this.seed += 1;
      nextId = this.seed.toString();
    }

    return nextId;
  }
}
