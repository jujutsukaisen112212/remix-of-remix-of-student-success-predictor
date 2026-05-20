import type React from "react";

type SplineViewerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    url?: string;
    "loading-anim-type"?: string;
    "events-target"?: string;
  },
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": SplineViewerProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": SplineViewerProps;
    }
  }
}

export {};