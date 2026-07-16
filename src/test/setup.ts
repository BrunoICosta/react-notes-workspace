import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { useUiStore } from '../features/layout/uiStore';
import { createEmptyWorkspace } from '../features/workspace/model/tree';
import { useWorkspaceStore } from '../features/workspace/store/workspaceStore';

afterEach(() => {
  cleanup();
  localStorage.clear();
  useWorkspaceStore.setState(createEmptyWorkspace());
  useUiStore.setState(useUiStore.getInitialState());
});
