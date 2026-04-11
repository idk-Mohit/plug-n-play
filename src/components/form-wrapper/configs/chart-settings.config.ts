import {
  ChartType as ChartTypeConst,
  GridType as GridTypeConst,
  AnimationType as AnimationTypeConst,
  InteractionMode as InteractionModeConst,
  TimeFormat as TimeFormatConst,
} from "@/enums/chart.enums";
import { PathCurveType as PathCurveTypeConst } from "@/d3-core/core/curves";
import {
  CircleDot,
  LayoutGrid,
  Palette,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { FormSectionConfig } from "../types";

/**
 * Chart settings: structured sections (collapsible) for the full settings drawer.
 */
export const chartSettingsFormConfig: FormSectionConfig[] = [
  {
    id: "basic-settings",
    title: "Chart & grid",
    icon: LayoutGrid,
    collapsible: true,
    defaultOpen: true,
    fields: [
      {
        name: "type",
        type: "select",
        label: "Chart type",
        required: true,
        options: [
          { value: ChartTypeConst.LINE, label: "Line" },
          { value: ChartTypeConst.AREA, label: "Area" },
          { value: ChartTypeConst.SCATTER, label: "Scatter" },
          { value: ChartTypeConst.BAR, label: "Bar (coming soon)" },
        ],
      },
      {
        name: "grid",
        type: "select",
        label: "Grid",
        required: true,
        options: [
          { value: GridTypeConst.NONE, label: "None" },
          { value: GridTypeConst.HORIZONTAL, label: "Horizontal" },
          { value: GridTypeConst.VERTICAL, label: "Vertical" },
          { value: GridTypeConst.BOTH, label: "Both" },
        ],
      },
      {
        name: "showAxes",
        type: "switch",
        label: "Show axes",
        description: "X and Y axes",
        layout: "inline",
      },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
    collapsible: true,
    defaultOpen: true,
    fields: [
      {
        name: "stroke",
        type: "color",
        label: "Stroke color",
        description: "Lines, areas, and scatter",
      },
      {
        name: "strokeWidth",
        type: "slider",
        label: "Stroke width",
        min: 1,
        max: 10,
        step: 0.5,
        showValue: true,
        formatValue: (value) => `${value}px`,
      },
      {
        name: "fontSize",
        type: "slider",
        label: "Label font size",
        min: 8,
        max: 20,
        step: 1,
        showValue: true,
        formatValue: (value) => `${value}px`,
      },
    ],
  },
  {
    id: "data-points",
    title: "Data points",
    icon: CircleDot,
    description: "Line and area charts only",
    collapsible: true,
    defaultOpen: true,
    fields: [
      {
        name: "showDataPoints",
        type: "switch",
        label: "Show data points",
        description: "Draw points on the series",
        layout: "inline",
      },
    ],
  },
  {
    id: "animation",
    title: "Animation",
    icon: Sparkles,
    collapsible: true,
    defaultOpen: false,
    fields: [
      {
        name: "animation.enabled",
        type: "switch",
        label: "Enable animation",
        description: "Transitions when data or settings change",
        layout: "inline",
      },
      {
        name: "animation.type",
        type: "select",
        label: "Style",
        required: true,
        options: [
          { value: AnimationTypeConst.FADE, label: "Fade" },
          { value: AnimationTypeConst.DRAW, label: "Draw" },
          { value: AnimationTypeConst.GROW, label: "Grow" },
          { value: AnimationTypeConst.NONE, label: "None" },
        ],
      },
      {
        name: "animation.duration",
        type: "slider",
        label: "Duration",
        min: 100,
        max: 2000,
        step: 100,
        showValue: true,
        formatValue: (value) => `${value}ms`,
      },
    ],
  },
  {
    id: "advanced",
    title: "Axes, curve & interaction",
    icon: SlidersHorizontal,
    collapsible: true,
    defaultOpen: false,
    fields: [
      {
        name: "pathCurve",
        type: "select",
        label: "Curve type",
        description: "Line and area interpolation",
        required: true,
        options: [
          { value: PathCurveTypeConst.LINEAR, label: "Linear" },
          { value: PathCurveTypeConst.NATURAL, label: "Natural" },
          { value: PathCurveTypeConst.BASIS, label: "Basis" },
          { value: PathCurveTypeConst.CARDINAL, label: "Cardinal" },
        ],
      },
      {
        name: "timeFormat",
        type: "select",
        label: "Time format",
        description: "Time axis labels",
        required: true,
        options: [
          { value: TimeFormatConst.AUTO, label: "Auto" },
          { value: TimeFormatConst.HH_MM, label: "HH:mm" },
          { value: TimeFormatConst.HH_MM_A, label: "hh:mm a" },
          { value: TimeFormatConst.MM_DD, label: "MM/DD" },
        ],
      },
      {
        name: "interaction",
        type: "select",
        label: "Interaction",
        description: "Pan / zoom",
        required: true,
        options: [
          { value: InteractionModeConst.NONE, label: "None" },
          { value: InteractionModeConst.PAN, label: "Pan" },
          { value: InteractionModeConst.ZOOM, label: "Zoom" },
          { value: InteractionModeConst.BOTH, label: "Both" },
        ],
      },
      {
        name: "tooltip",
        type: "switch",
        label: "Tooltips",
        description: "Show values on hover",
        layout: "inline",
      },
    ],
  },
];

export const getConditionalFields = (chartType: string) => {
  const conditionalFields: FormSectionConfig[] = [];

  if (
    chartType === ChartTypeConst.SCATTER ||
    chartType === ChartTypeConst.BAR
  ) {
    return conditionalFields;
  }

  return conditionalFields;
};
