import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useUiStore } from '../features/layout/uiStore';
import { createEmptyWorkspace } from '../features/workspace/model/tree';
import { useWorkspaceStore } from '../features/workspace/store/workspaceStore';

// Every test starts from an empty workspace; tests seed the pages they need.
beforeEach(() => {
  useWorkspaceStore.setState(createEmptyWorkspace());
  useUiStore.setState(useUiStore.getInitialState());
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
