"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_CMS_DATA, CmsData } from "@/lib/defaultCms";

interface CmsContextType {
  cms: CmsData;
  isLoading: boolean;
  refreshCms: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<CmsData>(DEFAULT_CMS_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCms = useCallback(async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        if (data.cms) {
          setCms(data.cms);
        }
      }
    } catch (e) {
      console.error("Failed to load CMS content:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  return (
    <CmsContext.Provider value={{ cms, isLoading, refreshCms: fetchCms }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used within a CmsProvider");
  }
  return context;
}
