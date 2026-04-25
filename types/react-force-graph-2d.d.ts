declare module "react-force-graph-2d" {
  import { ComponentType, MutableRefObject } from "react";

  export interface NodeObject {
    id: string | number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
    [key: string]: unknown;
  }

  export interface LinkObject {
    source: string | number | NodeObject;
    target: string | number | NodeObject;
    [key: string]: unknown;
  }

  export interface GraphData {
    nodes: NodeObject[];
    links: LinkObject[];
  }

  export interface ForceGraphProps {
    graphData: GraphData;
    width?: number;
    height?: number;
    backgroundColor?: string;
    nodeColor?: string | ((node: NodeObject) => string);
    nodeVal?: number | ((node: NodeObject) => number);
    nodeLabel?: string | ((node: NodeObject) => string);
    nodeCanvasObject?: (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    nodeCanvasObjectMode?: string | ((node: NodeObject) => string);
    linkColor?: string | ((link: LinkObject) => string);
    linkWidth?: number | ((link: LinkObject) => number);
    linkLabel?: string | ((link: LinkObject) => string);
    linkDirectionalArrowLength?: number | ((link: LinkObject) => number);
    onNodeClick?: (node: NodeObject, event: MouseEvent) => void;
    onNodeHover?: (node: NodeObject | null, prevNode: NodeObject | null) => void;
    onBackgroundClick?: () => void;
    warmupTicks?: number;
    cooldownTicks?: number;
    numDimensions?: number;
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    enableNodeDrag?: boolean;
    enableZoomInteraction?: boolean;
    enablePanInteraction?: boolean;
    ref?: MutableRefObject<unknown>;
    [key: string]: unknown;
  }

  const ForceGraph2D: ComponentType<ForceGraphProps>;
  export default ForceGraph2D;
}
