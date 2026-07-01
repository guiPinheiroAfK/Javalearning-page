import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { TopicPage } from "@/pages/TopicPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SourceCodePage } from "@/pages/SourceCodePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/topicos/:slug" element={<TopicPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/codigo-fonte" element={<SourceCodePage />} />
          <Route path="/codigo-fonte/:className" element={<SourceCodePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
