import { COMPONENT_MAP } from './component-mapping';
import type { AppState, Action } from './TemplateBuilder';
import React from 'react';

type CommandAction = (dispatch: React.Dispatch<Action>, state: AppState) => void;

interface Command {
  id: string;
  name: string;
  action: CommandAction;
}

export const staticCommands: Command[] = [
  {
    id: 'toggle-grid',
    name: 'Toggle Grid',
    action: (dispatch) => dispatch({ type: 'TOGGLE_GRID' }),
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    action: (dispatch, state) => dispatch({ type: 'SET_ZOOM', payload: Math.min(4, state.view.zoom + 0.1) }),
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    action: (dispatch, state) => dispatch({ type: 'SET_ZOOM', payload: Math.max(0.1, state.view.zoom - 0.1) }),
  },
  {
    id: 'zoom-to-100',
    name: 'Zoom to 100%',
    action: (dispatch) => dispatch({ type: 'SET_ZOOM', payload: 1 }),
  },
  {
    id: 'zoom-to-fit',
    name: 'Zoom to Fit',
    action: (dispatch, state) => {
      // Logic to calculate zoom to fit would go here
    },
  },
  {
    id: 'go-to-design-panel',
    name: 'Go to Design Panel',
    action: (dispatch) => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'design' }),
  },
  {
    id: 'go-to-layers-panel',
    name: 'Go to Layers Panel',
    action: (dispatch) => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'layers' }),
  },
  {
    id: 'go-to-theme-panel',
    name: 'Go to Theme Panel',
    action: (dispatch) => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'theme' }),
  },
  {
    id: 'delete-selected',
    name: 'Delete Selected Components',
    action: (dispatch) => dispatch({ type: 'DELETE_SELECTED' }),
  },
  {
    id: 'duplicate-selected',
    name: 'Duplicate Selected Components',
    action: (dispatch, state) => {
      state.selectedIds.forEach(id => dispatch({ type: 'DUPLICATE_COMPONENT', payload: id }));
    },
  },
];

export const getDynamicCommands = (state: AppState): Command[] => {
  return Object.keys(COMPONENT_MAP).map((type) => ({
    id: `add-${type}`,
    name: `Add ${COMPONENT_MAP[type].displayName}`,
    action: (dispatch) => {
      const { pan, zoom } = state.view;
      // This is a simplified calculation for the center of the viewport.
      // A more robust solution would involve getting the viewport dimensions.
      const x = -pan.x / zoom + 200 / zoom;
      const y = -pan.y / zoom + 200 / zoom;
      dispatch({ type: 'ADD_COMPONENT', payload: { componentType: type, x, y } });
    },
  }));
};
