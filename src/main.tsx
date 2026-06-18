import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/contexts/AuthContext";
import { LoadingProvider } from "./app/contexts/LoadingContext";
import { NotificationProvider } from "./app/contexts/NotificationContext";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <LoadingProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </LoadingProvider>
    </AuthProvider>
  </BrowserRouter>,
);
