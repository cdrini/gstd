// @ts-check

/**
 * @template { { id: string|number } } TNode
 * @template { { source: string|number, target: string|number, id?: string|number, weight?: number } } TEdge
 */
export class Graph {
  /**
   * @param {object} args0
   * @param {TNode[]} [args0.nodes]
   * @param {Array<TEdge | [string|number, string|number, Omit<Omit<TEdge, 'source'>, 'target'>?]>} [args0.edges]
   */
  constructor({ nodes = undefined, edges }) {
    this.edges = edges.map(e => this._normalizeEdge(e)) || [];
    /** @type {TNode[]} */
    this.nodes = nodes || uniq(this.edges.map(e => [e.source, e.target]).flat())
      .map(id => ({ id }));
  }

  /**
   * @param {TEdge | [string|number, string|number, Omit<Omit<TEdge, 'source'>, 'target'>]} edge
   * @returns {TEdge}
   */
  _normalizeEdge(edge) {
    if (Array.isArray(edge)) {
      return { source: edge[0], target: edge[1], ...(edge[2] || {}) };
    } else {
      return edge;
    }
  }

  /**
   * @param { string | number | TNode } nodeId
   * @returns { TNode | undefined }
   */
  findNode(nodeId) {
    return typeof nodeId == "string" || typeof nodeId == "number"
      ? this.nodes.find((n) => n.id == nodeId)
      : nodeId;
  }

  /**
   * @param { string | number | TNode } node
   * @returns { TEdge[] }
   */
  getOutEdges(node) {
    const nodeId = this.getNodeId(node);
    return this.edges.filter((e) => e.source == nodeId);
  }

  /**
   * @param { string | number | TNode } node Node ID or node object
   * @returns { TEdge[] }
   */
  getInEdges(node) {
    const nodeId = this.getNodeId(node);
    return this.edges.filter((e) => e.target == nodeId);
  }

  /**
   * @param { string | number | TNode } node Node ID or node object
   * @returns { string | number }
   */
  getNodeId(node) {
    return typeof node == "string"
      ? node
      : typeof node == "number"
      ? node
      : node.id;
  }

  *topologicalTraverse() {
    /** @type {Set<string|number>} */
    const seen = new Set();
    // This means where there's ambiguity, we will output nodes in the order
    // they were added to the graph.
    const nodePool = Array.from(this.nodes);

    while (nodePool.length) {
      const nextBatch = nodePool.filter((n) =>
        this.getInEdges(n).filter((e) => !seen.has(e.source)).length == 0
      );
      if (!nextBatch.length) {
        throw new Error("This graph cannot be topologically traversed.");
      }

      for (const node of nextBatch) {
        seen.add(this.getNodeId(node));
        nodePool.splice(nodePool.indexOf(node), 1);
        yield node;
      }

      // all done
      if (seen.size == this.nodes.length) {
        return;
      }
    }
  }


  // NOTE: Will take an option to allow cycles. This will make it effectively
  // run forever! Good for state machines.
  /**
   * 
   * @param {string | number | TNode | null} start
   * @returns {Generator<{ type: 'node', item: TNode } | { type: 'edge', item: TEdge }>}
   */
  *forEach(start=null) {
    /** @type {Set<string|number|TEdge>} */
    const seen = new Set();
    const startNode = start ? this.findNode(start) : null;

    while (true) {
      // Note this has not great runtime, but kinda cool that it doesn't need
      // a queue!
      let nextNode = null;
      if (startNode) {
        nextNode = !seen.has(this.getNodeId(startNode)) ? startNode : 
          this.nodes.find((n) => {
            if (seen.has(this.getNodeId(n))) {
              return false;
            }
            const inEdges = this.getInEdges(n);
            return inEdges.length > 0 && inEdges.some((e) => seen.has(e));
          });
      } else {
        nextNode = this.nodes.find((n) => {
          if (seen.has(this.getNodeId(n))) {
            return false;
          }
          return this.getInEdges(n).every((e) => seen.has(e))
        }) ||
          this.nodes.find((n) => !seen.has(this.getNodeId(n)));
      }
      if (!nextNode) {
        break;
      }

      seen.add(this.getNodeId(nextNode));
      yield {type: 'node', item: nextNode };

      for (const outEdge of this.getOutEdges(nextNode)) {
        seen.add(outEdge);
        yield { type: 'edge', item: outEdge };
      }
    }
  }

  /**
   * Reverse a new Graph with all edges in the graph reversed.
   * @returns {Graph<TNode, TEdge>}
   */
  reverse() {
    return new Graph({
      nodes: this.nodes,
      edges: this.edges.map((e) => ({ ...e, source: e.target, target: e.source })),
    });
  }

  /**
   * Get a new graph that is a subgraph containing all paths that begin with
   * `start`.
   * @param {string|number|TNode} start
   * @returns {Graph<TNode, TEdge>}
   */
  slice(start) {
    /** @type {TNode[]} */
    const nodes = [];
    /** @type {TEdge[]} */
    const edges = [];

    for (const {type, item} of this.forEach(start)) {
      if (type == 'node') {
        nodes.push(item);
      } else {
        edges.push(item);
      }
    }

    return new Graph({ nodes: Array.from(nodes), edges: Array.from(edges) });
  }

  /**
   * @template TAcc, TEdge
   * @param {TAcc} sourceValue
   * @param {TEdge} edge
   * @returns {TAcc}
   */
  static DEFAULT_EDGES_REDUCER(sourceValue, edge) {
    return sourceValue;
  }

  /**
   * @template [TAcc=number]
   * @param {object} args0
   * @param {function(TAcc[], TNode): TAcc} args0.nodes
   * @param {function(TAcc, TEdge): TAcc} args0.edges
   * @returns {TAcc}
   */
  reduce({
    nodes,
    edges=Graph.DEFAULT_EDGES_REDUCER,
    initial=0
  }) {
    /** @type {WeakMap<TNode|TEdge, TAcc>} */
    const values = new WeakMap();
    /** @type {TAcc} */
    let lastNodeValue = initial;

    for (const {type, item} of this.forEach()) {
      if (type == 'node') {
        const node = item;
        const inputValues = this.getInEdges(node).map((e) => /** @type {TAcc} */(values.get(e)));
        const nodeValue = nodes(inputValues, node);
        values.set(node, nodeValue);
        lastNodeValue = nodeValue;
      } else {
        const edge = item;
        const sourceNode = /** @type {TNode} */(this.findNode(edge.source));
        const edgeValue = edges(/** @type {TAcc} */(values.get(sourceNode)), edge);
        values.set(edge, edgeValue);
      }
    }
    const outputNodes = this.nodes.filter(n => !this.getOutEdges(n).length);
    if (outputNodes.length == 0) {
      // No output nodes means there likely was a cycle
      return lastNodeValue;
    } else if (outputNodes.length == 1) {
      // The expected case
      return /** @type {TAcc} */(values.get(outputNodes[0]));
    }
    else {
      // Unclear what to do!
      throw new Error('Graph has multiple output nodes');
    }
  }

  async log(opts) {
    const svg = await this.svg(opts);
    const width = parseFloat(svg.getAttribute("width"));
    const height = parseFloat(svg.getAttribute("height"));

    const style = [
      // Hacky way of forcing image's viewport using `font-size` and `line-height`
      `font-size: ${height}px;`,
      `line-height: ${height}px;`,

      // Hacky way of forcing a middle/center anchor point for the image
      `padding: 0px ${width / 2}px;`,

      // Set image dimensions
      `background-size: ${width}px ${height}px;`,

      // Set image URL
      `background: url('data:image/svg+xml;base64,${
        btoa(svg.outerHTML)
      }');`,
      `background-repeat: no-repeat;`,
    ].join(" ");

    // note the space after %c
    console.log("%c ", style);
  }

  // /**
  //  * @returns {Promise<SVGElement>}
  //  */
  // async _force_svg({width = 300, height = 300} = {}) {
  //     if (!window.d3) await import('https://unpkg.com/d3@6.2');
  //     let node, link, edgepaths, edgelabels;

  //     const svg = d3.create("svg")
  //         .attr("viewBox", [0, 0, width, height])
  //         .attr('xmlns', 'http://www.w3.org/2000/svg')
  //         .attr('version', '1.1')
  //         .attr('width', width)
  //         .attr('height', height);
      
  //     document.body.appendChild(svg.node());

  //     svg.append('defs')
  //         .append('marker')
  //             .attr('id', 'arrowhead')
  //             .attr('viewBox', '-0 -5 10 10')
  //             .attr('refX', 13)
  //             .attr('refY', 0)
  //             .attr('orient', 'auto')
  //             .attr('markerWidth', 13)
  //             .attr('markerHeight', 13)
  //         .append('svg:path')
  //         .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
  //         .attr('fill', 'black')
  //         .style('stroke','none');

  //     const simulation = d3.forceSimulation()
  //         .force("link", d3.forceLink().id(d => d.id).distance(100).strength(1))
  //         .force("charge", d3.forceManyBody())
  //         .force("center", d3.forceCenter(width / 2, height / 2))
  //         .stop();

  //     function update(links, nodes) {
  //         link = svg.selectAll(".link")
  //             .data(links)
  //             .enter()
  //             .append("line")
  //             .attr("class", "link")
  //             .attr('marker-end','url(#arrowhead)')

  //         link.append("title")
  //             .text(d => 'weight' in d ? d.weight : d.id);

  //         edgepaths = svg.selectAll(".edgepath")
  //             .data(links)
  //             .enter()
  //             .append('path')
  //                 .attr('class', 'edgepath')
  //                 .attr('fill-opacity', 0)
  //                 .attr('stroke-opacity', 0)
  //                 .attr('id', (d, i) => `edgepath${i}`)
  //             .style("pointer-events", "none");

  //         edgelabels = svg.selectAll(".edgelabel")
  //             .data(links)
  //             .enter()
  //             .append('text')
  //             .style("pointer-events", "none")
  //                 .attr('class', 'edgelabel')
  //                 .attr('id', (d, i) => `edgelabel${i}`)
  //                 .attr('font-size', 10)
  //                 .attr('fill', '#aaa');

  //         edgelabels.append('textPath')
  //             .attr('href', (d, i) => `#edgepath${i}`)
  //             .style("text-anchor", "middle")
  //             .style("pointer-events", "none")
  //             .attr("startOffset", "50%")
  //             .text(d => 'weight' in d ? d.weight : d.id);

  //         node = svg.selectAll(".node")
  //             .data(nodes)
  //             .enter()
  //             .append("g")
  //             .attr("class", "node");

  //         node.append("circle")
  //             .attr("r", 5)
  //             .style("fill", "white");

  //         node.append("title")
  //             .text(d => d.id);

  //         node.append("text")
  //             .attr("dy", -3)
  //             .text(d => d.id);

  //         simulation
  //             .nodes(nodes);

  //         simulation.force("link")
  //             .links(links);
  //     }

  //     function ticked() {
  //         link
  //             .attr('stroke', '#aaa')
  //             .attr("x1", d => d.source.x)
  //             .attr("y1", d => d.source.y)
  //             .attr("x2", d => d.target.x)
  //             .attr("y2", d => d.target.y);

  //         node
  //             .attr("transform", d => `translate(${d.x}, ${d.y})`);

  //         edgepaths
  //             .attr('d', d => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);

  //         edgelabels.attr('transform', function (d) {
  //             if (d.target.x < d.source.x) {
  //                 const bbox = this.getBBox();
  //                 const rx = bbox.x + bbox.width / 2;
  //                 const ry = bbox.y + bbox.height / 2;
  //                 return `rotate(180 ${rx} ${ry})`;
  //             }
  //             else {
  //                 return 'rotate(0)';
  //             }
  //         });
  //     }

  //     // Make a copy of the edges, because we store data on them
  //     update(this.edges.map(e => ({ source: e.source, target: e.target })), this.nodes);
  //     // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
  //     for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
  //         simulation.tick();
  //     }
  //     ticked();
  //     return svg.node();
  // }

  /**
   * @returns {Promise<SVGElement>}
   */
  async svg({nodeLabel=null} = {}) {
    if (!window.d3) await import('https://unpkg.com/d3@6.2');

    const hasShortNodeLabels = this.nodes
      .slice(0, 5)
      .every(n => (nodeLabel ? n[nodeLabel] : n.id).toString().length < 3);

    const uuid = 'gstd-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const svg = d3.create("svg")
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('version', '1.1')
      .attr('id', uuid)

    const rendered = svg.node();
    document.body.appendChild(rendered);

    // Need to limit to uuid to avoid style leaking
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      #${uuid} .edgepath {
        stroke: currentColor;
        marker-end: url(#arrowhead);
      }

      #${uuid} .edgelabel {
        pointer-events: none;
        font-size: 10px;
        fill: currentColor;
      }

      #${uuid} textPath {
        text-anchor: middle;
        pointer-events: none;
        font-family: system-ui,sans-serif;
      }

      #${uuid} .node circle {
        stroke: currentColor;
        fill: transparent;
      }

      #${uuid} .node text {
        fill: currentColor;
        text-anchor: middle;
        font-family: system-ui,sans-serif;
        dominant-baseline: central;
      }
    `;
    rendered.appendChild(styleTag);

    svg.append('defs')
      .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', 'currentColor')
      .style('stroke','none');

    const edgepaths = svg.selectAll(".edgepath")
      .data(this.edges)
      .enter()
      .append('path')
        .attr('class', 'edgepath')
        .attr('id', (d, i) => `edgepath${i}`);

    const edgelabels = svg.selectAll(".edgelabel")
      .data(this.edges)
      .enter()
      .append('text')
        .attr('class', 'edgelabel')
        .attr('id', (d, i) => `edgelabel${i}`);

    edgelabels.append('textPath')
      .attr('href', (d, i) => `#edgepath${i}`)
      .attr("startOffset", "50%")
      .text(d => (
        'weight' in d ? d.weight :
        'id' in d ? d.id :
        Object.keys(d).filter(k => !['source', 'target'].includes(k)).map(k => d[k])[0] || ''
      ));

    const node = svg.selectAll(".node")
      .data(this.nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    if (hasShortNodeLabels) {
      node.append("circle")
        .attr("r", 20);
    }

    node.append("text")
      .text(d => nodeLabel ? d[nodeLabel] : d.id);

    // Render each node in a 'row', where the row is the
    // distance from an 'input' node -- where an 'input' node is
    // a node with no incoming edges.
    /** @type {Map<string|number, number>} */
    const nodeIdToRow = new Map();
    const rows = [];
    for (const {type, item: node} of this.forEach()) {
      if (type == 'edge') continue;

      const inEdges = this.getInEdges(node);
      let row = 0;
      if (inEdges.length == 0 || inEdges.every(e => !nodeIdToRow.has(e.source))) {
        row = 0;
      } else {
        row = Math.max(...inEdges
          .filter(e => nodeIdToRow.has(e.source))
          .map(e => /** @type {number} */(nodeIdToRow.get(e.source)))
        ) + 1;
      }

      nodeIdToRow.set(this.getNodeId(node), row);
      rows[row] = (rows[row] || []).concat(node);
    }

    const gridWidth = 100;
    const gridHeight = 100;
    const totalWidth = Math.max(...rows.map(r => r.length)) * gridWidth;
    const totalHeight = (Math.max(...nodeIdToRow.values()) + 1) * gridHeight;
    
    svg
      .attr("viewBox", [0, 0, totalWidth, totalHeight])
      .attr('width', totalWidth)
      .attr('height', totalHeight);

    const nodeToPos = new Map();

    node.attr('transform', function(d) {
      const rowNum = /** @type {number} */(nodeIdToRow.get(d.id));
      const row = rows[rowNum];
      const cellWidth = totalWidth / row.length;
      const col = row.indexOf(d);
      const xPos = col * cellWidth + cellWidth / 2;
      const yPos = rowNum * gridHeight + gridHeight / 2;
      nodeToPos.set(d.id, {x: xPos, y: yPos});
      return `translate(${xPos}, ${yPos})`;
    });

    const linkPadding = 20;
    edgepaths
      .attr('d', function(d) {
        const source = nodeToPos.get(d.source);
        const target = nodeToPos.get(d.target);
        const xDist = target.x - source.x;
        const yDist = target.y - source.y;
        const hyp = Math.sqrt(xDist ** 2 + yDist ** 2);
        const linkPaddingRatio = linkPadding / hyp;
        const pos = {
          x1: source.x + linkPaddingRatio * xDist,
          y1: source.y + linkPaddingRatio * yDist,
          x2: target.x - linkPaddingRatio * xDist,
          y2: target.y - linkPaddingRatio * yDist,
        };
        if (!hasShortNodeLabels) {
          pos.y1 = source.y + linkPadding *.75;
          pos.y2 = target.y - linkPadding *.75;
        }

        return `M ${pos.x1} ${pos.y1} L ${pos.x2} ${pos.y2}`;
      });
    // edgelabels.attr('transform', function (d) {
    //   const source = nodeToPos.get(d.source);
    //   const target = nodeToPos.get(d.target);
    //   if (target.x < source.x) {
    //       const bbox = this.getBBox();
    //       const rx = bbox.x + bbox.width / 2;
    //       const ry = bbox.y + bbox.height / 2;
    //       return `rotate(180 ${rx} ${ry})`;
    //   }
    //   else {
    //       return 'rotate(0)';
    //   }
    // });

    document.body.removeChild(rendered);
    return rendered;
  }
}

/**
 * @template T
 * @param {T} item
 * @returns {T}
 */
function IDENTITY_FN(item) { return item; }

/**
 * @template T
 * Dedupes the items in `items` by the value returned by `key`.
 * Stable deduping, so the first item with a given key is kept.
 * @param {T[]} items 
 * @param {(item: T) => any} [key]
 * @returns {T[]}
 */
export function uniq(items, key=IDENTITY_FN) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}
