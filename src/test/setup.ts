import '@testing-library/jest-dom/vitest';
import i18n from '../i18n';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useUiStore } from '../features/layout/uiStore';
import { createEmptyWorkspace } from '../features/workspace/model/tree';
import { useWorkspaceStore } from '../features/workspace/store/workspaceStore';

// Every test starts in pt-BR (jsdom reports en-US) with an empty workspace;
// tests switch language or seed the pages they need.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
  useWorkspaceStore.setState(createEmptyWorkspace());
  useUiStore.setState(useUiStore.getInitialState());
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
