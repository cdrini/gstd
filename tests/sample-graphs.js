export default {
    EmptyGraph: {
        nodes: [],
        edges: [],
    },
    TwoNodeCycle: {
        nodes: [
            { id: 1 },
            { id: 2 },
        ],
        edges: [
            { source: 1, target: 2 },
            { source: 2, target: 1 },
        ],
    },
    ThreeNodeCycle: {
        nodes: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
        ],
        edges: [
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 3, target: 1 },
        ],
    },
    ReadmeMathExample: {
        nodes: [
            { id: 1, value: '-' },
            { id: 2, value: '+' },
            { id: 3, value: '*' },
            { id: 4, value: 45 },
            { id: 5, value: 15 },
            { id: 6, value: 9 },
            { id: 7, value: 2 },
        ],
        edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 2, target: 5 },
            { source: 3, target: 6 },
            { source: 3, target: 7 },
        ],
    },
    FullAoc2020Example: {
        nodes: [
            { id: 'light red' },
            { id: 'bright white' },
            { id: 'muted yellow' },
            { id: 'dark orange' },
            { id: 'shiny gold' },
            { id: 'faded blue' },
            { id: 'dark olive' },
            { id: 'dotted black' },
            { id: 'vibrant plum' },
        ],
        edges: [
            { source: 'light red', target:'bright white', count: 1 },
            { source: 'light red', target:'muted yellow', count: 2 },
            { source: 'dark orange', target:'bright white', count: 3 },
            { source: 'dark orange', target:'muted yellow', count: 4 },
            { source: 'bright white', target:'shiny gold', count: 1 },
            { source: 'muted yellow', target:'shiny gold', count: 2 },
            { source: 'muted yellow', target:'faded blue', count: 9 },
            { source: 'shiny gold', target:'dark olive', count: 1 },
            { source: 'shiny gold', target:'vibrant plum', count: 2 },
            { source: 'dark olive', target:'faded blue', count: 3 },
            { source: 'dark olive', target:'dotted black', count: 4 },
            { source: 'vibrant plum', target:'faded blue', count: 5 },
            { source: 'vibrant plum', target:'dotted black', count: 6 },
         ],
    },
};
