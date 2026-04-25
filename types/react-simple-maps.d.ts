declare module "react-simple-maps" {
  import { ComponentType, SVGProps, MouseEvent } from "react";

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: unknown;
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseMove?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: () => void;
    style?: {
      default?: React.CSSProperties & { outline?: string; fill?: string; stroke?: string; cursor?: string };
      hover?: React.CSSProperties & { outline?: string; fill?: string; cursor?: string };
      pressed?: React.CSSProperties & { outline?: string };
    };
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Array<{ id: string; rsmKey: string; [key: string]: unknown }> }) => React.ReactNode;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    onClick?: () => void;
    children?: React.ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>;
}
