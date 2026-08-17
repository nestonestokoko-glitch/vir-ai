import { useState, useCallback, useEffect } from "react";
import { defaultKineticConfig, type KineticConfig } from "../components/kinetic/kineticEngine";

// Define the project type based on PRD section 33 (Project JSON)
export type BackgroundType =
  | { type: "solid"; value: string }
  | { type: "gradient"; value: string }; // Simplified for MVP

export type TextSegment = {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  font: string;
  weight: number;
  style: string;
  animation: string;
  position: {
    x: number;
    y: number;
  };
};

export type Format = "portrait" | "landscape";

export type Project = {
  width: number;
  height: number;
  fps: number;
  duration: number;
  format: Format;
  background: BackgroundType;
  textColor: string;
  alignment: "left" | "center" | "right";
  segments: TextSegment[];
  // Editor state (not stored in final JSON)
  text?: string;
  font?: string;
  weight?: number;
  style?: string;
  animation?: string;
  size?: number; // text size scale multiplier (1 = default)
  animationSpeed?: number; // reveal speed multiplier (1 = normal, higher = faster)
  kinetic?: KineticConfig; // configuration for the "Kinetic" typography style
};

// Default project configuration
const DEFAULT_PROJECT: Project = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 15,
  format: "portrait",
  background: { type: "solid", value: "#000000" },
  textColor: "#FFFFFF",
  alignment: "center",
  segments: [],
  text: "",
  font: "Inter",
  weight: 400,
  style: "Modern",
  animation: "Fade",
  size: 1,
  animationSpeed: 1,
  kinetic: defaultKineticConfig,
};

export function useProject() {
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT);

  // Update dimensions when format changes
  useEffect(() => {
    if (project.format === "portrait") {
      setProject(prev => ({ ...prev, width: 1080, height: 1920 }));
    } else {
      setProject(prev => ({ ...prev, width: 1920, height: 1080 }));
    }
  }, [project.format]);

  // Load from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem("vir-ai-project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        const merged: Project = { ...DEFAULT_PROJECT, ...parsed };
        // Deep-merge nested kinetic config: older saved projects predate newly-added fields
        // (e.g. enterDuration/holdDuration/...), and a shallow spread would drop them and leave
        // undefined values that crash the config panel. Fill missing fields from defaults.
        if (parsed.kinetic) merged.kinetic = { ...defaultKineticConfig, ...parsed.kinetic };
        setProject(merged);
      } catch (e) {
        console.error("Failed to load project from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage whenever project changes
  useEffect(() => {
    localStorage.setItem("vir-ai-project", JSON.stringify(project));
  }, [project]);

  const updateProject = useCallback(
    (updates: Partial<Project>) => {
      setProject((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetProject = useCallback(() => {
    setProject(DEFAULT_PROJECT);
  }, []);

  return {
    project,
    updateProject,
    resetProject,
  };
}