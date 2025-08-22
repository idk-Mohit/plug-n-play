import { ThemeProvider } from "./components/theme-provider";
import ViewRenderer from "./components/ViewRenderer";
import Dashboard from "./containers/dashboard/Dashboard";

/**
 * The main app component.
 *
 * This component wraps the entire app in a {@link ThemeProvider} and
 * a {@link Dashboard} component.
 *
 * The {@link ThemeProvider} component provides a theme to the app, and
 * allows the user to switch between different themes.
 *
 * The {@link Dashboard} component provides the main layout of the app,
 * and contains the navigation sidebar and the main content area.
 *
 * The main content area is rendered by the {@link ViewRenderer} component,
 * which is a wrapper around the {@link Suspense} component from React.
 *
 * The {@link ViewRenderer} component renders the current view based on
 * the value of the `activeViewAtom` atom.
 *
 * @returns The main app component.
 */
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Dashboard>
        <ViewRenderer />
      </Dashboard>
    </ThemeProvider>
  );
}

export default App;
