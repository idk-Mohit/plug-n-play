import {
  ChartType as ChartTypeConst,
  GridType as GridTypeConst,
  AnimationType as AnimationTypeConst,
  InteractionMode as InteractionModeConst,
  TimeFormat as TimeFormatConst,
  PathCurveType as PathCurveTypeConst,
} from "@/enums/chart.enums";
import type { FormSectionConfig } from "../types";

/**
 * Configuration for chart settings form using FormWrapper
 * This replaces the manual form implementation in ChartFullSettingDrawer
 */
export const chartSettingsFormConfig: FormSectionConfig[] = [
  {
    id: "basic-settings",
    title: "Basic Settings",
    fields: [
      {
        name: "type",
        type: "select",
        label: "Chart Type",
        required: true,
        options: [
          { value: ChartTypeConst.LINE, label: "Line" },
          { value: ChartTypeConst.AREA, label: "Area" },
          { value: ChartTypeConst.SCATTER, label: "Scatter" },
        ],
      },
      {
        name: "grid",
        type: "select",
        label: "Grid Type",
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
        label: "Show Axes",
        description: "Display X and Y axes on the chart",
      },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    fields: [
      {
        name: "stroke",
        type: "color",
        label: "Stroke Color",
        description: "Primary color for lines, areas, and scatter points",
      },
      {
        name: "strokeWidth",
        type: "slider",
        label: "Stroke Width",
        min: 1,
        max: 10,
        step: 0.5,
        showValue: true,
        formatValue: (value) => `${value}px`,
      },
      {
        name: "fontSize",
        type: "slider",
        label: "Font Size",
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
    title: "Data Points",
    description: "Configure data point visibility for line and area charts",
    fields: [
      {
        name: "showDataPoints",
        type: "switch",
        label: "Show Data Points",
        description: "Display individual data points on line and area charts",
      },
    ],
  },
  {
    id: "animation",
    title: "Animation",
    fields: [
      {
        name: "animation.enabled",
        type: "switch",
        label: "Enable Animation",
        description: "Animate chart rendering and transitions",
      },
      {
        name: "animation.type",
        type: "select",
        label: "Animation Type",
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
        label: "Animation Duration",
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
    title: "Advanced Settings",
    fields: [
      {
        name: "pathCurve",
        type: "select",
        label: "Curve Type",
        description: "Curve interpolation for line and area charts",
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
        label: "Time Format",
        description: "Format for time-based axis labels",
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
        label: "Interaction Mode",
        description: "User interaction capabilities",
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
        label: "Enable Tooltip",
        description: "Show data tooltips on hover",
      },
    ],
  },
];

/**
 * Conditional field configurations based on chart type
 */
export const getConditionalFields = (chartType: string) => {
  const conditionalFields: FormSectionConfig[] = [];

  // Hide "Show Data Points" for scatter charts
  if (chartType === ChartTypeConst.SCATTER) {
    return conditionalFields; // Return empty array to exclude the section
  }

  return conditionalFields;
};
