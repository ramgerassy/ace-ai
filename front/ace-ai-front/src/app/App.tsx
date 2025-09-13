import AppRouter from './router';
import ErrorBoundary from '../components/Global/errorBoundary';
import { AppProvider } from '../context/AppContext';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
