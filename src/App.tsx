import { useEffect, useState } from "react";
import LineChart from "./charts/line-chart/LineChart";
import type { timeseriesdata } from "./types/data.types";
import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./containers/dashboard/Dashboard";
import { SectionCards } from "./components/card/SectionCard";
// import { ResourceStatsPanel } from "./containers/analytics/Resources";
import { Input } from "./components/ui/input";
import useDebounce from "./hooks/useDebouce";
import { Card, CardContent } from "./components/ui/card";

function App() {
  const [userInput, setUserInput] = useState<number>(500);
  const [data, setData] = useState<timeseriesdata[]>([]);
  const debouncedUserInput = useDebounce({ value: userInput, delay: 500 }); // Assuming you have a debounce hook, you can use it here

  const worker = new Worker(
    new URL("./worker/dataWorker.ts", import.meta.url),
    { type: "module" }
  );
  useEffect(() => {
    worker.postMessage({
      task: "generate_series",
      payload: { count: debouncedUserInput },
    });

    worker.onmessage = (e) => {
      const { status, data } = e.data;
      if (status === "success") {
        setData(data);
      }
    };
  }, [debouncedUserInput]);

  console.log("rendering");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Dashboard>
        <Input
          name="data-count"
          id="data-count"
          type="number"
          placeholder="Enter number of data points"
          className="mx-6 w-100"
          defaultValue={userInput}
          onChange={(e) => setUserInput(Number(e.target.value))}
        />
        <div className="flex flex-1 gap-4 mx-6 flex-wrap">
          {/* <Card className="@container/card lg:px-6 px-4 "> */}
          <Card className="@container/card lg:px-6 px-4 w-[100%]">
            <LineChart height={400} data={data} />
          </Card>
          {/* <ResourceStatsPanel /> */}
        </div>
        <SectionCards />
      </Dashboard>
      {/* <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>  */}
    </ThemeProvider>
  );
}

export default App;
