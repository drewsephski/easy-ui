# Template Builder Page Documentation

## Overview

The Template Builder page (`app/template-builder/page.tsx`) is a client-side rendered application that provides a visual interface for users to build and customize UI templates by dragging and dropping pre-defined components onto a canvas. It supports real-time preview, component property editing, undo/redo functionality, and the ability to save and load templates, as well as export the generated code.

## Project Architecture

The Template Builder is structured as a single Next.js client component (`'use client'`). It leverages React's state management hooks (`useState`, `useMemo`, `useCallback`) for managing the canvas components, selected component properties, UI states (e.g., preview mode, sidebar collapse), and a comprehensive history for undo/redo operations.

The page integrates several key external and internal libraries:

- **`react-dnd` and `react-dnd-html5-backend`/`react-dnd-touch-backend`**: For robust drag-and-drop functionality, supporting both desktop and mobile interactions.
- **`lucide-react`**: For a rich set of icons used throughout the UI.
- **Dynamic Imports (`next/dynamic`)**: Components are dynamically imported to optimize initial load times and handle potential loading errors gracefully.
- **Internal Components**: Relies heavily on custom components like `DraggableComponent`, `DroppableCanvas`, `PropertiesPanel`, `ExportModal`, and `BetaModal`.

## Key Components

### `TemplateBuilderPage` (Main Component)

This is the root component of the template builder. It manages all the state, logic, and rendering of the builder interface.

### UI Components

- [`BetaModal`](components/BetaModal.tsx): Displays a beta feature modal.
- [`DndProvider`](https://react-dnd.github.io/react-dnd/docs/api/dnd-provider): Provides the drag-and-drop context for all draggable and droppable elements.
- [`DraggableComponent`](components/DraggableComponent.tsx): A wrapper component that makes other components draggable and handles their positioning on the canvas.
- [`DroppableCanvas`](components/DroppableCanvas.tsx): The main canvas area where components are dropped and arranged. It handles drop events and visualizes the grid.
- [`PropertiesPanel`](components/PropertiesPanel.tsx): A sidebar panel that displays and allows editing of properties for the currently selected component.
- [`ExportModal`](components/ExportModal.tsx): A modal that provides options to export the current template's code.
- [`Input`](components/ui/input.tsx): A reusable input component from the UI library.

### Data & Utility Components

- `componentMap`: An object mapping component names (strings) to their dynamically imported React components. It includes both "EasyUI" and "MagicUI" components. The `safeImport` helper ensures robust loading with error and loading states.
- `componentIcons`: An object mapping component names to their corresponding `lucide-react` icons for display in the component palette.
- `initialComponents`: An array derived from `componentMap` that provides metadata for each available component, including its ID, content (name), category, and icon.
- `componentProps` (from [`lib/component-props.ts`](lib/component-props.ts)): Provides default properties for each component, used when a component is first dropped onto the canvas.
- `DropZoneType` and `ComponentType`, `InitialComponentType` (from [`types/template-builder.ts`](types/template-builder.ts)): TypeScript types defining the structure of components and drop zones within the builder.

## Dependencies

### External Libraries

- `react`
- `react-dnd`
- `react-dnd-html5-backend`
- `react-dnd-touch-backend`
- `react-device-detect`
- `next/dynamic`
- `lucide-react`

### Internal Modules

- `@/components/BetaModal`
- `@/components/PropertiesPanel`
- `@/components/ExportModal`
- `@/components/ui/input`
- `@/components/DraggableComponent`
- `@/components/DroppableCanvas`
- `@/lib/component-props`
- `@/types/template-builder`
- `@/components/easyui/*` (various EasyUI components)
- `@/components/magicui/*` (various MagicUI components)

## State Management

The `TemplateBuilderPage` component manages its state using React hooks:

- `components`: An array of `ComponentType` objects representing the components currently on the canvas.
- `selectedComponent`: The `ComponentType` object of the currently selected component for property editing.
- `isPreview`: Boolean to toggle between build mode and preview mode.
- `showExportModal`: Boolean to control the visibility of the export modal.
- `searchTerm`: String for filtering components in the palette.
- `selectedCategory`: String for filtering components by category.
- `history`: An array of `ComponentType[][]` storing snapshots of the `components` array for undo/redo functionality.
- `historyIndex`: The current index in the `history` array.
- `isDragging`: Boolean indicating if a component is currently being dragged.
- `showGrid`: Boolean to toggle the visibility of the grid on the canvas.
- `sidebarCollapsed`: Boolean to control the collapse state of the component palette sidebar.
- `zoomLevel`: Number representing the current zoom level of the canvas (e.g., 100 for 100%).
- `templateName`: String for the name of the current template.
- `isLoading`: Boolean to indicate loading states (though not extensively used in the provided snippet).

## Key Functions and Callbacks

- `safeImport`: A helper function using `next/dynamic` to dynamically import components, providing loading and error fallback UIs.
- `handleDrop`: Callback executed when a component is dropped onto the canvas. It creates a new component instance with default properties and adds it to the `components` state and history.
- `handleMove`: Callback for reordering components on the canvas via drag-and-drop.
- `handleDelete`: Callback to remove a component from the canvas and update history.
- `handleDuplicate`: Callback to create a duplicate of an existing component, including a deep copy of its properties.
- `handlePropChange`: Callback to update a specific property of a component on the canvas.
- `undo`: Reverts the `components` state to the previous snapshot in history.
- `redo`: Advances the `components` state to the next snapshot in history.
- `clearCanvas`: Clears all components from the canvas after user confirmation.
- `handleZoomIn`, `handleZoomOut`, `resetZoom`: Functions to control the zoom level of the canvas.
- `saveTemplate`: Saves the current template (components and name) as a JSON file.
- `loadTemplate`: Loads a template from a JSON file, updating the canvas and template name.
- `filteredComponents`: A memoized list of components in the palette, filtered by search term and selected category.
- `dndBackend`: Memoized selection of `HTML5Backend` or `TouchBackend` based on `isMobile` detection.

## Design Patterns

- **Drag and Drop (DnD)**: Implemented using `react-dnd` for interactive component placement and reordering.
- **Dynamic Imports**: Utilizes `next/dynamic` for lazy loading components, improving initial page load performance.
- **Controlled Components**: UI elements like `Input` and the component properties are controlled by React state.
- **Callback Memoization (`useCallback`)**: Prevents unnecessary re-renders of child components by memoizing event handlers.
- **State History**: A custom history stack is maintained for robust undo/redo functionality.
- **Component-Based Architecture**: The page is composed of smaller, reusable React components, promoting modularity and maintainability.

## Examples

### Adding a Component

Users can drag any component from the left sidebar (Component Palette) onto the `DroppableCanvas`. Upon dropping, a new instance of the component is added to the canvas with its default properties.

### Editing Component Properties

Clicking on a component on the canvas selects it, and its editable properties are displayed in the `PropertiesPanel` on the right. Users can modify these properties, and the changes are reflected in real-time on the canvas.

### Saving and Loading Templates

The header provides "Save" and "Load" buttons. "Save" downloads the current canvas layout as a JSON file. "Load" allows users to upload a previously saved JSON file to restore a template.

### Exporting Code

The "Export" button in the header opens a modal (`ExportModal`) that generates and displays the React code for the current template, which users can then copy for their projects.
