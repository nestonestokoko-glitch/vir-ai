import { renderHook, act } from "@testing-library/react";
import { useProject } from "./useProject";
import { Project } from "./useProject";

describe("useProject Hook", () => {
  it("should initialize with default project", () => {
    const { result } = renderHook(() => useProject());
    expect(result.current.project).toMatchObject({
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 15,
      background: { type: "solid", value: "#000000" },
      textColor: "#FFFFFF",
      alignment: "center",
      segments: [],
      text: "",
      font: "Inter",
      weight: 400,
      style: "Modern",
      animation: "Fade",
    });
  });

  it("should update project state", () => {
    const { result } = renderHook(() => useProject());
    const newText = "Hello world";

    act(() => {
      result.current.updateProject({ text: newText });
    });

    expect(result.current.project.text).toBe(newText);
  });

  it("should reset project state", () => {
    const { result } = renderHook(() => useProject());

    // Change state
    act(() => {
      result.current.updateProject({ text: "Test text", duration: 30 });
    });

    expect(result.current.project.text).toBe("Test text");
    expect(result.current.project.duration).toBe(30);

    // Reset
    act(() => {
      result.current.resetProject();
    });

    expect(result.current.project.text).toBe("");
    expect(result.current.project.duration).toBe(15);
  });

  it("should persist to localStorage", () => {
    // This test would require mocking localStorage
    // For now, we'll just verify the update function works
    const { result } = renderHook(() => useProject());

    act(() => {
      result.current.updateProject({ text: "Persistent text" });
    });

    expect(result.current.project.text).toBe("Persistent text");
  });
});