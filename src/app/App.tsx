import { useApplyTheme } from '../features/preferences/useApplyTheme';
import { ThemeToggle } from '../shared/ui/ThemeToggle';

export default function App() {
  useApplyTheme();

  return (
    <main style={{ padding: 'var(--space-6)' }}>
      <h1>Notes Workspace</h1>
      <ThemeToggle />
    </main>
  );
}
