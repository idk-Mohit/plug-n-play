import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./containers/dashboard/Dashboard";
import Home from "./containers/home/Home";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Dashboard>
        <Home />
      </Dashboard>
    </ThemeProvider>
  );
}

export default App;
