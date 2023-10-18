import { createRef, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../main";
import { setHoveredNode, unsetHoveredNode } from "./call_stack_graph.slice";
import dagreD3 from "dagre-d3";
import { select } from "d3-selection";

interface Node {
  depth: number;
  indexInLayer: number;
  name: string;
  callee: string;
  hoverNeighbor: boolean;
}

export const CallStackGraph = () => {
  const dispatch = useAppDispatch();
  const hoveredNode = useAppSelector(
    (state) => state.callStackGraph.hoveredNode
  );

  const edges = useAppSelector((state) => state.callStackGraph.edges);
  const ref = createRef<SVGSVGElement>();

  useEffect(() => {
    const graph = new dagreD3.graphlib.Graph({
      directed: true,
      multigraph: false,
      compound: true,
    });
    graph.setGraph({ rankdir: "TB", ranker: "network-simplex" });
    const render: any = new dagreD3.render();

    const isFirstInValue = (
      value: unknown,
      index: number,
      array: Array<unknown>
    ) => {
      return array.indexOf(value) === index;
    };

    const nodeNames = edges.flatMap((edge) => [edge.caller, edge.callee]);
    const uniqueNodeNames = nodeNames.filter(isFirstInValue);

    // calleeからcallerを辿る
    // callerになっていないやつを探す
    const rootNode = uniqueNodeNames.find((nodeName) => {
      return !edges.some((edge) => edge.caller === nodeName);
    });

    const findCallerNodesRecursively = (
      node: string,
      depth: number,
      baseIndex: number
    ): Array<Node> => {
      const callers = edges
        .filter((edge) => {
          return edge.callee === node;
        })
        .map((edge) => edge.caller);

      const callerNodes = callers.map((caller, index) => {
        return {
          depth,
          indexInLayer: baseIndex + index,
          name: caller,
          callee: node,
          hoverNeighbor: false,
        } as Node;
      });

      return callerNodes.flatMap((callerNode) => {
        return [
          callerNode,
          ...findCallerNodesRecursively(
            callerNode.name,
            callerNode.depth + 1,
            callerNode.indexInLayer
          ),
        ];
      });
    };

    const nodes = findCallerNodesRecursively(rootNode!, 1, 0);

    graph.setNode(rootNode!, {
      label: rootNode,
      shape: "circle",
      width: 30,
      height: 30,
    });

    const depths = nodes.map((node) => node.depth);
    const uniqueDepths = depths.filter(isFirstInValue).toSorted();
    uniqueDepths.forEach((depth) => {
      nodes
        .filter((node) => node.depth === depth)
        .forEach((node, index) => {
          const highlight = edges.some((edge) => {
            return (
              (edge.callee === node.name && edge.caller === hoveredNode) ||
              (edge.caller === node.name && edge.callee === hoveredNode)
            );
          });

          if (!graph.hasNode(node.name)) {
            const biggerIndex = Math.max(index, node.indexInLayer);
            graph.setNode(node.name, {
              // x: biggerIndex,
              // y: node.depth,
              // label: node.name,
              // size: highlight ? 50 : 20,
              // color: highlight ? "red" : "blue",
              // labelColor: highlight ? "red" : "blue",
              label: node.name,
              shape: "circle",
              width: 30,
              height: 30,
            });
          }
        });
    });

    nodes.forEach((node) => {
      if (!graph.hasEdge(node.name, node.callee)) {
        graph.setEdge(node.name, node.callee, {
          label: "", //`${node.name}->${node.callee}`,
          style: "stroke: black; stroke-width: 1px; fill: none;",
          arrowhead: "normal",
          lineInterpolate: "bundle",
          lineTension: 0.5,
        });
      }
    });

    if (ref.current != null) {
      select(ref.current).call(render, graph);
    }
  }, [edges, hoveredNode, ref]);
  const error = useAppSelector((state) => state.callStackGraph.error);
  let errorElement = null;

  if (error !== null) {
    errorElement = <p>{error}</p>;
  }

  return [
    errorElement,
    <div> a </div>,
    <svg ref={ref} style={{ height: "100vh", width: "100vw" }}></svg>,
  ];
};
