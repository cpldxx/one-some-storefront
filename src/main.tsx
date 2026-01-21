import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// AbortError를 전역적으로 무시 (React Strict Mode에서 발생하는 정상 동작)
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'AbortError' ||
    event.reason?.message?.includes('AbortError') ||
    event.reason?.message?.includes('aborted')
  ) {
    event.preventDefault();
    console.log('[App] Suppressed AbortError (expected in dev mode)');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
