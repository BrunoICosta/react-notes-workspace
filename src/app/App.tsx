import { AppLayout } from '../features/layout/AppLayout';
import { useApplyTheme } from '../features/preferences/useApplyTheme';

export default function App() {
  useApplyTheme();
  return <AppLayout />;
}
