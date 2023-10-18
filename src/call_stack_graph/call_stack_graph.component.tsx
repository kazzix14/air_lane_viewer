import { useEffect } from "react";
import { MultiDirectedGraph } from "graphology";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useAppDispatch, useAppSelector } from "../main";
import { setHoveredNode, unsetHoveredNode } from "./call_stack_graph.slice";

interface Node {
  depth: number;
  indexInLayer: number;
  name: string;
  callee: string;
  hoverNeighbor: boolean;
}

export const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const registerEvents = useRegisterEvents();
  const dispatch = useAppDispatch();
  const hoveredNode = useAppSelector(
    (state) => state.callStackGraph.hoveredNode
  );

  const edges = useAppSelector((state) => state.callStackGraph.edges);

  useEffect(() => {
    const graph = new MultiDirectedGraph({ settings: { defaultLabelColor: "#aaa"} });


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

    graph.addNode(rootNode!, {
      x: 0,
      y: 0,
      label: rootNode,
      size: 20,
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
            graph.addNode(node.name, {
              x: biggerIndex,
              y: node.depth,
              label: node.name,
              size: highlight ? 50 : 20,
              color: highlight ? "red" : "blue",
              labelColor: highlight ? "red" : "blue",
            });
          }
        });
    });

    nodes.forEach((node) => {
      if (!graph.hasEdge(`${node.name}->${node.callee}`)) {
        graph.addEdgeWithKey(
          `${node.name}->${node.callee}`,
          node.name,
          node.callee,
          {
            label: `${node.name}->${node.callee}`,
          }
        );
      }
    });

    loadGraph(graph);
  }, [loadGraph, edges, hoveredNode]);

  const sigma = useSigma();

  useEffect(() => {});

  useEffect(() => {
    registerEvents({
      enterNode: (e) => {
        dispatch(setHoveredNode(e.node));
        //setDraggedNode(e.node);
        //sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
      },
      leaveNode: (e) => {
        dispatch(unsetHoveredNode());
        //setDraggedNode(e.node);
        //sigma.getGraph().setNodeAttribute(e.node, "highlighted", false);
      },
    });
  }, [registerEvents, sigma]);

  return null;
};

export const CallStackGraph = () => {
  const error = useAppSelector((state) => state.callStackGraph.error);
  let errorElement = null;

  if (error !== null) {
    errorElement = <p>{error}</p>;
  }

  return [
    errorElement,
    <SigmaContainer
      graph={MultiDirectedGraph}
      className="border"
      style={{ height: "1500px", width: "1500px", padding: "32px" }}>
      <MyGraph />
    </SigmaContainer>,
  ];
};
