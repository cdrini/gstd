import { describe, expect, test } from "vitest";
import { Graph } from "../index.js";
import SAMPLE_GRAPHS from "./sample-graphs.js";

test("can construct empty graph", () => {
  const graph = new Graph({
    nodes: [],
    edges: [],
  });
  expect(graph.nodes).toEqual([]);
  expect(graph.edges).toEqual([]);
});

describe('constructor', () => {
    test('Supports construction from edges only', () => {
        const graph = new Graph({
            edges: [
                { source: 'A', target: 'B' },
                { source: 'B', target: 'C' },
                { source: 'A', target: 'C' },
            ]
        });
        expect(graph.nodes).toEqual([
            { id: 'A' },
            { id: 'B' },
            { id: 'C' },
        ]);
    });

    test('Supports construction from edges only in array format', () => {
        const graph = new Graph({
            edges: [
                ['A', 'B'],
                ['B', 'C'],
                ['A', 'C'],
            ]
        });
        expect(graph.nodes).toEqual([
            { id: 'A' },
            { id: 'B' },
            { id: 'C' },
        ]);
        expect(graph.edges).toEqual([
            { source: 'A', target: 'B' },
            { source: 'B', target: 'C' },
            { source: 'A', target: 'C' },
        ]);
    });
});

test("Can support class-based nodes", () => {
    class Cell {
        constructor(id) {
            this.id = id;
        }
    }
    
    const graph = new Graph({
        nodes: [new Cell(1), new Cell(2)],
        edges: [],
    });
    expect(graph.nodes).toEqual([new Cell(1), new Cell(2)]);
    expect(graph.edges).toEqual([]);
});

//     const g2 = new Graph({ nodes: [{ id: 1 }, {id: 2 }, { id: 3 }], edges: [ { source: 1, target: 2 }, { source: 1, target: 3 }]});
// g2.log();
test("Simplified AoC 2020 Example", () => {
  const input = `
        shiny gold bags contain 2 dark red bags.
        dark red bags contain 2 dark orange bags.
        dark orange bags contain 2 dark yellow bags.
        dark yellow bags contain 2 dark green bags.
        dark green bags contain 2 dark blue bags.
        dark blue bags contain 2 dark violet bags.
        dark violet bags contain no other bags.`
    .trim()
    .split(".")
    .map((line) => line.trim())
    .filter((x) => x);

  /** @type {{ source: string, target: string, count: number }[]} */
  const edges = input
    .flatMap((line) => {
      const [bag, contentsStr] = line.split(" bags contain ");
      return contentsStr
        .split(", ")
        .map((s) => s.trim())
        .filter((s) => s != "no other bags")
        .map((s) => {
          const m = s.match(/^(?<count>\d+) (?<bag>.*)? bags?$/);
          return {
            source: bag,
            target: m.groups.bag,
            count: parseFloat(m.groups.count),
          };
        });
    });

  const graph = new Graph({
    edges,
    nodes: Array.from(new Set(edges.flatMap((e) => [e.source, e.target]))).map(
      (id) => ({ id }),
    ),
  });

  expect(graph.nodes.length).toBe(7);
  expect(graph.edges.length).toBe(6);
  expect(graph.getOutEdges("shiny gold")).toEqual([
    { source: "shiny gold", target: "dark red", count: 2 },
  ]);
  expect(graph.getOutEdges("dark voilet")).toEqual([]);

});

describe("topologicalTraverse", () => {
    test("Can traverse a simple graph", () => {
        const graph = new Graph({
            nodes: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ],
            edges: [
                { source: 1, target: 2 },
                { source: 1, target: 3 },
            ]
        });
        expect(Array.from(graph.topologicalTraverse()).map(x => x.id)).toEqual([1, 2, 3]);
    });

    test("Can traverse a simple graph with a cycle", () => {
        const graph = new Graph({
            nodes: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ],
            edges: [
                { source: 1, target: 2 },
                { source: 2, target: 3 },
                { source: 3, target: 1 },
            ]
        });
        expect(() => Array.from(graph.topologicalTraverse())).toThrow();
    });

    test("Full AoC 2020 Example", () => {
        const graph = new Graph(SAMPLE_GRAPHS.FullAoc2020Example);
        expect(Array.from(graph.topologicalTraverse()).map(x => x.id)).toEqual([
            'light red',
            'dark orange',
            'bright white',
            'muted yellow',
            'shiny gold',
            'dark olive',
            'vibrant plum',
            'faded blue',
            'dotted black',
        ]);
    });
});

describe('slice', () => {
    test('Single node from big graph', () => {
        const graph = new Graph(SAMPLE_GRAPHS.FullAoc2020Example);
        const sliced = graph.slice('faded blue');
        expect(sliced.nodes).toEqual([{ id: 'faded blue' }]);
        expect(sliced.edges).toEqual([]);
    });

    test('Small slice from big graph', () => {
        const graph = new Graph(SAMPLE_GRAPHS.FullAoc2020Example);
        const sliced = graph.slice('dark olive');
        expect(sliced.nodes).toEqual([
            { id: 'dark olive' },
            { id: 'faded blue' },
            { id: 'dotted black' },
        ]);
        expect(sliced.edges).toEqual([
            { source: 'dark olive', target: 'faded blue', count: 3 },
            { source: 'dark olive', target: 'dotted black', count: 4 },
        ]);
    });

    test('Works in cyclic graphs', () => {
        const twoGraph = new Graph(SAMPLE_GRAPHS.TwoNodeCycle);
        const sliced = twoGraph.slice(1);
        expect(sliced.nodes).toEqual([
            { id: 1 },
            { id: 2 },
        ]);
        expect(sliced.edges).toEqual([
            { source: 1, target: 2 },
            { source: 2, target: 1 },
        ]);

        const threeGraph = new Graph(SAMPLE_GRAPHS.ThreeNodeCycle);
        const sliced2 = threeGraph.slice(1);
        expect(sliced2.nodes).toEqual([
            { id: 1 },
            { id: 2 },
            { id: 3 },
        ]);
        expect(sliced2.edges).toEqual([
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 3, target: 1 },
        ]);
    });

    test('Full AoC 2020 Example', () => {
        const graph = new Graph(SAMPLE_GRAPHS.FullAoc2020Example);
        const sliced = graph.slice('shiny gold');
        expect(sliced.nodes).toEqual([
            { id: 'shiny gold' },
            { id: 'dark olive' },
            { id: 'faded blue' },
            { id: 'dotted black' },
            { id: 'vibrant plum' },
        ]);
        expect(sliced.edges).toEqual([
            { source: 'shiny gold', target: 'dark olive', count: 1 },
            { source: 'shiny gold', target: 'vibrant plum', count: 2 },
            { source: 'dark olive', target: 'faded blue', count: 3 },
            { source: 'dark olive', target: 'dotted black', count: 4 },
            { source: 'vibrant plum', target: 'faded blue', count: 5 },
            { source: 'vibrant plum', target: 'dotted black', count: 6 },
        ]);
    });
});

describe('reduce', () => {
    test('Empty graph', () => {
        const graph = new Graph(SAMPLE_GRAPHS.EmptyGraph);
        const reduced = graph.reduce({nodes: (acc, node) => acc + node.id, initial: ''});
        expect(reduced).toBe('');
    });

    test('Cyclic graph', () => {
        const graph = new Graph(SAMPLE_GRAPHS.ThreeNodeCycle);
        const reduced = graph.reduce({nodes: (acc, node) => acc + node.id, initial: ''});
        expect(reduced).toBe('123');
    });
    
    test('Simple graph', () => {
        const graph = new Graph({
            nodes: [
                { id: 1, op: 'add' },
                { id: 2, value: 2 },
                { id: 3, value: 3 },
            ],
            edges: [
                { source: 1, target: 2 },
                { source: 1, target: 3 },
            ]
        });
        const reduced = graph.reverse().reduce({
            nodes(inputValues, node) {
                if (node.op === 'add') {
                    return inputValues.reduce((acc, x) => acc + x, 0);
                } else {
                    return node.value;
                }
            }
        });
        expect(reduced).toBe(5);
    });

    test('Readme Math Example', () => {
        const graph = new Graph(SAMPLE_GRAPHS.ReadmeMathExample);
        const reduced = graph.reverse().reduce({
            nodes: ([accLeft, accRight], node) =>
                node.value == '-' ? accLeft - accRight :
                node.value == '+' ? accLeft + accRight :
                node.value == '*' ? accLeft * accRight :
                node.value == '/' ? accLeft / accRight :
                node.value,
        });
        expect(reduced).toBe(42);
    });

    test('Full AoC 2020 Example', () => {
        const graph = new Graph(SAMPLE_GRAPHS.FullAoc2020Example);
        const reduced = graph.slice('shiny gold').reverse().reduce({
            nodes: (accInEdges, curNode) => 1 + sum(accInEdges),
            edges: (accSource, curEdge) => curEdge.count * accSource,
            initial: '',
        });
        expect(reduced).toBe(33);
    });
});

/**
 * @param {number[]} nums
 * @returns {number}
 */
function sum(nums) {
    return nums.reduce((acc, x) => acc + x, 0);
}
