# gstd

⚠ This project is in very early development. Many of these features are not yet implemented. And the ones that are, aren't implemented particularly well. ⚠

**gstd** is a standard library / interface for conveniently working with node graphs. Inspired by things like the in-built `Array` constructor for dealing with arrays and lodash, `gstd.Graph` aims to provide similar, functional programming inspired interfaces for working with graphs.

### Motivation

Graphs are a powerful abstract data type for a wide variety of problem spaces. However few languages provide in-built support for manipulating and storing data in graphs like they do for arrays, lists, sets, or even trees. Unlike arrays and lists, graphs are inherently two-dimensional -- this makes them difficult to visualize. What if working with graphs was as easy as working with arrays? What if all the interfaces and functions you were used to using on lists and arrays were also available? What if you could easily print a graph as well for simple debugging? Answering these questions is the aim of `gstd`.


## Documentation

### Status

- ✅ Creating a graph from nodes and edges
- ✅ Creating a graph from only edges
- [ ] `.log()` in terminal
- [ ] `.log()` in browser console
- ✅ `.slice()`
- ✅ `.reduce()`
- [ ] `.reduceReverse()`
- ✅ `.reverse()`
- ✅ `.forEach()` Implementation with no options
- [ ] `.map()`
- ✅ Math tree example
- ✅ AoC reduce example
- [ ] State machine example


### Creating a graph

Creating a graph is as simple as:

```js
const graph = new Graph({
    edges: [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'A', target: 'C' },
    ]
});
```

But understanding this graph from the data format above is complicated — so let's view it in a more two dimensional format, using `graph.log()`.

### Logging in a terminal

In a terminal environment, where images are unsupported, the graph is displayed using ascii art:

```
        ┌───┐
        │ A ├───┐
        └─┬─┘   │
          │     │
          ▼     │
        ┌─┴─┐   │
        │ B │   │
        └─┬─┘   │
          │     │
          ▼     │
        ┌─┴─┐   │
        │ C │◄──┘
        └───┘
```

And there are plenty of options:

`graph.log({ boxes: false })`


```
          A ──┐
          │   │
          ▼   │
          B   │
          │   │
          ▼   │
          C ◄─┘
```


`graph.log({ boxes: false, orientation: horizontal })`

```
A ──► B ──► C
│           ▲
└───────────┘
```

`graph.log({ boxes: false, diagonals: true })`

```
    A
  ╱   ╲
 ▼     ╲
 B      ╲
  ╲      ▼
    ───► C
```

### Logging in browser console

The browser console supports svg! So we can log much better graphics there with `graph.log()`

<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   width="100%"
   height="150"
   viewBox="0 0 60.868374 64.021881"
   version="1.1"
   style="padding: 10px 0;">
  <defs>
    <marker
       style="overflow:visible"
       id="marker1632"
       orient="auto">
      <path
         transform="scale(0.4)"
         style="fill:currentColor;stroke:currentColor"
         d="M 5.77,0 -2.88,5 V -5 Z" />
    </marker>
  </defs>
  <g transform="translate(-37.719544,-55.092062)">
    <g>
      <circle
         style="fill:transparent;stroke:currentColor;stroke-width:1"
         cx="68.688271"
         cy="64.946495"
         r="9.3544331" />
      <text
         xml:space="preserve"
         style="font-size:10.5833px;line-height:1;font-family:sans-serif;fill:currentColor"
         x="65.21376"
         y="68.688263"
        >A</text>
    </g>
    <g
       transform="translate(-1.0690781,4.0090429)">
      <circle
         style="fill:transparent;stroke:currentColor;stroke-width:1"
         cx="48.643055"
         cy="95.682487"
         r="9.3544331" />
      <text
         xml:space="preserve"
         style="font-size:10.5833px;line-height:1;font-family:sans-serif;fill:currentColor"
         x="44.901276"
         y="99.691528">B</text>
    </g>
    <g
       id="g41"
       transform="translate(4.0090429,3.6880495)">
      <circle
         style="fill:transparent;stroke:currentColor;stroke-width:1"
         cx="84.724442"
         cy="105.57146"
         r="9.3544331" />
      <text
         xml:space="preserve"
         style="font-size:10.5833px;line-height:1;font-family:sans-serif;fill:currentColor"
         x="80.715385"
         y="109.31322">C</text>
    </g>
    <path
       style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#marker1632)"
       d="M 61.471992,71.360963 50.558608,86.789457" />
    <path
       style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#marker1632)"
       d="M 74.300928,72.162772 84.574201,95.651377" />
    <path
       style="fill:none;stroke:currentColor;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;marker-end:url(#marker1632)"
       d="m 56.260235,102.49786 19.688568,4.73405" />
  </g>
</svg>



## Examples

### Demonstrative, toy example

The problem that inspired this project was a question from Advent of Code 2020. In it, you are given the following rules:

```
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
```

Let's say we wanted to determine the total number of bags you would be holding, if you were holding a **shiny gold bag**.

Representing this as a `gstd.Graph`, we have:

```js
const graph = new Graph({
   edges: [
      ['light red', 'bright white', {count: 1}],
      ['light red', 'muted yellow', {count: 2}],
      ['dark orange', 'bright white', {count: 3}],
      ['dark orange', 'muted yellow', {count: 4}],
      ['bright white', 'shiny gold', {count: 1}],
      ['muted yellow', 'shiny gold', {count: 2}],
      ['muted yellow', 'faded blue', {count: 9}],
      ['shiny gold', 'dark olive', {count: 1}],
      ['shiny gold', 'vibrant plum', {count: 2}],
      ['dark olive', 'faded blue', {count: 3}],
      ['dark olive', 'dotted black', {count: 4}],
      ['vibrant plum', 'faded blue', {count: 5}],
      ['vibrant plum', 'dotted black', {count: 6}],
   ],
});

graph.log();
```

<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="490.365" viewBox="0 0 140.255 209.294">
   <defs>
     <marker style="overflow:visible" id="a" refX="0" refY="0" orient="auto">
       <path transform="scale(.4)" style="fill:currentColor;stroke:currentColor;stroke-width:1" d="m5.77 0-8.65 5V-5Z"/>
     </marker>
   </defs>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="69.522" y="10.321"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">light red</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="27.774" y="74.227"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">bright white</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="108.906" y="74.27"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">muted yellow</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M32.122 16.471-5.956 65.957" transform="translate(23.194 -1.69)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="10.711" y="37.585" transform="translate(23.194 -1.69)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">1</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m56.697 15.415 31.448 48.933" transform="translate(28.102 -.634)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="76.886" y="39.709" transform="translate(28.102 -.634)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">2</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="68.275" y="37.308"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">dark orange</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m11.3 13.475 13.242 21.423" transform="translate(62.521 27.683)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="13.504" y="28.612" transform="translate(62.521 27.683)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">4</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="56.959" y="107.462"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">shiny gold</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m51.398 15.105 13 20.477" transform="translate(-8.847 62.224)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="52.868" y="29.718" transform="translate(-8.847 62.224)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">1</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M30.737 22.787 15.458 44.211" transform="translate(27.695 18.47)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="26.541" y="39.03" transform="translate(27.695 18.47)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">3</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M70.906 15.105 57.738 35.582" transform="translate(13.241 62.635)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="69.087" y="28.864" transform="translate(13.241 62.635)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">2</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="57.829" y="204.905"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">faded blue</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M92.553 17.986 37.422 135.71" transform="translate(41.411 60.517)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="70.814" y="83.264" transform="translate(41.411 60.517)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">9</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="19.847" y="145.615"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">dark olive</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="73.392" y="145.715"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">vibrant plum</tspan></text>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m6.644 5.793 10.668 25.995" transform="translate(64.944 104.847)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="7.94" y="21.28" transform="translate(64.944 104.847)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">2</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M38.42 15.105 21.627 41.39" transform="translate(8.915 95.244)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="36.766" y="30.824" transform="translate(8.915 95.244)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">1</tspan></text>
   </g>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="53.038" y="175.345"><tspan x="53.038" y="175.345"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">dotted</tspan></tspan><tspan x="53.038" y="183.312"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">black</tspan></tspan></text>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m7.879 3.232-22.235 44.99" transform="translate(80.215 145.485)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x=".118" y="31.037" transform="translate(80.215 145.485)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">5</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M14.458 5.789 5.582 22.385" transform="translate(55.48 142.927)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="14.63" y="15.672" transform="translate(55.48 142.927)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">6</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m-8.285 10.091 25.808 44.991" transform="translate(22.215 138.625)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="2.485" y="43.376" transform="translate(22.215 138.625)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">3</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m4.576 5.789 8.877 16.596" transform="translate(32.956 142.927)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="4.386" y="18.233" transform="translate(32.956 142.927)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">4</tspan></text>
   </g>
 </svg>
 

Since we're only interested in the shiny gold node and its descendants, let's `slice` the graph:

```js
graph.slice('shiny gold').log();
```

<svg xmlns="http://www.w3.org/2000/svg" width="248.403" height="262.769" viewBox="0 0 100.799 112.153">
   <defs>
      <marker style="overflow:visible" id="a" refX="0" refY="0" orient="auto">
         <path transform="scale(.4)" style="fill:currentColor;stroke:currentColor;stroke-width:1" d="m5.77 0-8.65 5V-5Z"/>
      </marker>
   </defs>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="50.545" y="10.321"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">shiny gold</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="50.462" y="107.764"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">faded blue</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="23.756" y="48.474"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">dark olive</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="76.273" y="48.574"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">vibrant plum</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M38.42 15.105 21.627 41.39" transform="translate(-.447 -1.897)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="36.766" y="30.824" transform="translate(-.447 -1.897)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">1</tspan></text>
   <text xml:space="preserve" style="font-weight:400;font-size:7.96717px;line-height:1;font-family:sans-serif;fill:currentColor" x="50.549" y="80.468"><tspan x="50.549" y="80.468"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">dotted</tspan></tspan><tspan x="50.549" y="88.435"><tspan style="font-weight:400;font-size:7.96717px;font-family:sans-serif;text-align:center;text-anchor:middle">black</tspan></tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m7.879 3.232-22.235 44.99" transform="translate(79.6 48.344)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x=".118" y="31.037" transform="translate(79.6 48.344)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">5</tspan></text>
   <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m14.458 5.789-9.73 18.037" transform="translate(52.637 45.786)"/>
   <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="13.776" y="19.087" transform="translate(52.637 45.786)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">6</tspan></text>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m-8.28 10.091 23.133 44.991" transform="translate(21.596 41.484)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="-1.013" y="36.997" transform="translate(21.596 41.484)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">3</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="m4.576 5.789 9.73 18.037" transform="translate(30.113 45.786)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="4.386" y="18.233" transform="translate(30.113 45.786)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">4</tspan></text>
   </g>
   <g>
     <path style="fill:none;stroke:currentColor;stroke-width:1;marker-end:url(#a)" d="M20.592 15.105 37.383 41.39" transform="translate(42.235 -1.897)"/>
     <text xml:space="preserve" style="font-weight:400;font-size:6.829px;line-height:1;font-family:sans-serif;fill:currentColor" x="36.766" y="30.824" transform="translate(42.235 -1.897)"><tspan style="font-weight:400;font-size:6.829px;font-family:sans-serif;text-align:center;text-anchor:middle">2</tspan></text>
   </g>
</svg>
 

Just like e.g. `['a', 'b', 'c'].slice(1)` returns a new `Array` from `b` to the end, `graph.slice('shiny gold')` returns a new graph, that contains the `shiny gold` node and any downstream nodes and edges.

If we were working with an array, we would likely use something like `reduce` to aggregate down to a single number. With `gstd.Graph`, we use... `reduce`! But unlike arrays, we have two types of elements: nodes and edges. We can reduce over either or both.

```js
graph
   .slice('shiny gold')
   .reduceReverse({
      nodes: (accInEdges, curNode) => 1 + _.sum(accInEdges),
      edges: (accNode, curEdge) => curEdge.count * accNode,
   });
```

And that's it! That returns the correct value. But what did we do exactly? Like `reduce` for arrays, this code can look a little cryptic the first time you see it.

The end goal of a `reduce` operation like this is to end up with a single value. So we need to convert every element (every node and every edge) of the graph into a number and then combine those numbers somehow. The `nodes` function is given the computed values of the downstream edges, and the node itself to determine what value the current node should get. The `edges` function does the same for edges. It is given the computed value of the node it points to and the current edge to determine the value.

Note we begin at the node which has no children, since we are reducing in `reverse` order with `reduceReverse` (analogous to `reduceRight` for arrays). We do this because in order to determine the value of a node, the values of all downstream nodes to already be computed. Here's a step-by-step of the computations performed:

| Index | Function called                             | Computed Value | Notes                                                                |
| ----- | ------------------------------------------- | -------------- | ------                                                               |
| 0     | `nodes([], faded_blue)`               | 1              | The node has no downstream edges, so computation begins here.               |
| 1     | `nodes([], dotted_black)`             | 1              | This node also has no downstream edges. |
| 2     | `edges(1, dark_olive→faded_blue)`   | 3              | This edge's downstream node has already been computed, so its value can now be computed. We multiply the `count` of the edge with the node it's connected to. |
| 3     | `edges(1, dark_olive→dotted_black)` | 4              |  |
| 4     | `nodes([3, 4], dark_olive)`           | 8              | Now that all its down stream elements have been reduced to a number, we can determine the value of `dark olive`. |

<center>⋮</center>

And so on, until the value of `shiny gold` is reduced to 33.

### Reduce Trees

Trees can be seen as a type of graph, so let's try reducing a simple parse of the mathematical expression `45 + 15 - 9 * 2`.

```js
const graph = gstd.treeToGraph({
   tree: {
      value: '-',
      children: [
         {
            value: '+'
            children: [
               { value: 45 },
               { value: 15 },
            ]
         },
         {
            value: '*'
            children: [
               { value: 9 },
               { value: 2 },
            ]
         },
      ]
   }
});
graph.log();
```

<svg viewBox="0,0,200,82.5" width="100%" style="max-height:200px">
   <style>
      .node ellipse {
         fill: none;
         stroke: currentColor;
      }
      .node text {
         font-size: 0.8em;
         fill: currentColor;
      }
      .link {
         fill: none;
         stroke: currentColor;
         stroke-width: 1px;
         marker-end: url(#a);
      }
   </style>
   <defs>
     <marker style="overflow:visible" id="a" refX="0" refY="0" orient="auto">
       <path transform="scale(.4)" style="fill:currentColor;stroke:currentColor;stroke-width:1" d="m5.77 0-8.65 5V-5Z"/>
     </marker>
   </defs>
    <g class="main" transform="translate(100,11)">
        <g class="links">
            <line class="link" x1="-10" y1="0" x2="-50" y2="20"></line>
            <line class="link" x1="10" y1="0" x2="50" y2="20"></line>
            <line class="link" x1="-66" y1="38" x2="-72" y2="47"></line>
            <line class="link" x1="-54" y1="38" x2="-47" y2="47"></line>
            <line class="link" x1="54" y1="38" x2="47" y2="47"></line>
            <line class="link" x1="66" y1="38" x2="72" y2="47"></line>
        </g>
        <g class="nodes">
            <g class="node" data-type="OperatorNode" transform="translate(0,0)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">-</text>
            </g>
            <g class="node" data-type="OperatorNode" transform="translate(-60,30)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">+</text>
            </g>
            <g class="node" data-type="OperatorNode" transform="translate(60,30)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">*</text>
            </g>
            <g class="node" data-type="ConstantNode" transform="translate(-80,60)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">45</text>
            </g>
            <g class="node" data-type="ConstantNode" transform="translate(-40,60)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">15</text>
            </g>
            <g class="node" data-type="ConstantNode" transform="translate(40,60)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">9</text>
            </g>
            <g class="node" data-type="ConstantNode" transform="translate(80,60)">
                <ellipse rx="10" ry="10"></ellipse>
                <text text-anchor="middle" alignment-baseline="central">2</text>
            </g>
        </g>
    </g>
</svg>

To determine the value of the formula, we can simply reduce once more:

```js
graph.reduceReverse({
   nodes: ([accLeft, accRight], node) =>
      node.value == '-' ? accLeft - accRight :
      node.value == '+' ? accLeft + accRight :
      node.value == '*' ? accLeft * accRight :
      node.value == '/' ? accLeft / accRight :
      node.value,
});
```

And you get that the value is, of course, 42.

Note how in this example, we don't specify an `edges` reduction function since it is not necessary.


### Auto-moving search

Here we use `gstd.Graph` to define a state machine for a robot looking for a key on a 10x10 grid.

```js
const startState = {
   position: [1, 1],
   direction: 'E',
   grid: `
      🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳      
      🔳🔽⬜⬜⬜⬜⬜⬜⬜🔳
      🔳❎⬜⬜⬜⬜⬜⬜⬜🔳
      🔳❎⬜⬜⬜⬜⬜⬜⬜🔳
      🔳❎⬜⬜⬜⬜⬜⬜⬜🔳
      🔳❎❎❎❎🔳🔳🔳🔳🔳
      🔳🔳🔳🔳❎⬜⬜⬜⬜🔳
      🔳❎❎🔴❎⬜⬜🔑⬜🔳
      🔳❎❎❎❎⬜⬜⬜⬜🔳
      🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳
   `.trim().split('\n').map(row => Array.from(row.trim()));
};
const directions = ['N', 'E', 'S', 'W'];

function getNextPosition(x, y, direction) {
   return (
      direction == 'N' ? [x    , y - 1] :
      direction == 'E' ? [x + 1, y    ] :
      direction == 'S' ? [x    , y + 1] :
      direction == 'W' ? [x - 1, y    ] :
      null
   );
}

function getNextTile({position: [x, y], direction, grid}) {
   const [nextX, nextY] = getNextPosition(x, y, direction);
   return grid[nextY][nextX];
}

const stateMachine = new gstd.Graph({
   nodes: {
      step: (state) => {
         // Mark current spot as already seen
         state.grid[state.position[1]][state.position[0]] = '*';
         state.position = getNextPosition(...state.position, direction);
      },

      'turn cw': (state) => {
         state.direction = directions[
            (directions.indexOf(state.direction) + 1) % directions.length
         ];
      }
   }
   edges: [
      ['look', 'has obstacle', {test: (state) => getNextTile(state) == '🔳'}],
      ['look', 'path is clear', {test: (state) => getNextTile(state) == '⬜'}],
      ['look', 'already visited', {test: (state) => getNextTile(state) == '*'}],
      ['look', 'found key!', {test: (state) => getNextTile(state) == '🔑'}],

      ['path is clear', 'step']
      ['has obstacle', 'turn cw'],
      ['already visited', 'turn cw'],

      ['turn cw', 'look'],
      ['step', 'look'],
   ]
});

stateMachine.forEach({
   startNode: 'look',
   initialValue: startState,
   transition: (state, node) => node(state)
})
```