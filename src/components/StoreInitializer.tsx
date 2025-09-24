import { useStore } from "@/store/store";
import { useEffect, useState } from "react";

export function StoreInitializer() {
  const [initialized, setInitialized] = useState(false);
  const loadInitialData = useStore((s) => s.loadInitialData);

  useEffect(() => {
    if (!initialized) {
      loadInitialData();
      setInitialized(true);
    }
  }, [initialized, loadInitialData]);

  return null;
}