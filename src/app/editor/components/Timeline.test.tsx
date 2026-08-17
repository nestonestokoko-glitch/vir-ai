import { render, screen, fireEvent } from "@testing-library/react";
import Timeline from "./Timeline";

describe("Timeline Component", () => {
  const mockProject = {
    duration: 15,
    fps: 30,
    segments: [
      {
        id: "1",
        text: "Hey",
        startFrame: 0,
        endFrame: 90, // 3 seconds at 30fps
        font: "Inter",
        weight: 700,
        style: "Modern",
        animation: "Fade",
        position: { x: 0, y: 0 },
      },
      {
        id: "2",
        text: "I",
        startFrame: 90,
        endFrame: 180, // 3 seconds at 30fps
        font: "Inter",
        weight: 700,
        style: "Modern",
        animation: "Scale",
        position: { x: 0, y: 0 },
      },
    ],
  };

  const mockOnSegmentUpdate = jest.fn();
  const mockOnSegmentDelete = jest.fn();
  const mockOnSegmentAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render timeline with segments", () => {
    render(
      <Timeline
        project={mockProject}
        onSegmentUpdate={mockOnSegmentUpdate}
        onSegmentDelete={mockOnSegmentDelete}
        onSegmentAdd={mockOnSegmentAdd}
      />
    );

    // Check that segments are rendered
    const segmentElements = screen.getAllByRole("group"); // Assuming we use role="group" for draggable elements
    expect(segmentElements.length).toBeGreaterThanOrEqual(2); // At least our 2 segments
  });

  it("should display segment text", () => {
    render(
      <Timeline
        project={mockProject}
        onSegmentUpdate={mockOnSegmentUpdate}
        onSegmentDelete={mockOnSegmentDelete}
        onSegmentAdd={mockOnSegmentAdd}
      />
    );

    expect(screen.getByText("Hey")).toBeInTheDocument();
    expect(screen.getByText("I")).toBeInTheDocument();
  });

  it("should display time labels", () => {
    render(
      <Timeline
        project={mockProject}
        onSegmentUpdate={mockOnSegmentUpdate}
        onSegmentDelete={mockOnSegmentDelete}
        onSegmentAdd={mockOnSegmentAdd}
      />
    );

    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByText("0:15")).toBeInTheDocument(); // 15 seconds
  });

  it("should call onSegmentDelete when delete button is clicked", () => {
    render(
      <Timeline
        project={mockProject}
        onSegmentUpdate={mockOnSegmentUpdate}
        onSegmentDelete={mockOnSegmentDelete}
        onSegmentAdd={mockOnSegmentAdd}
      />
    );

    // Find and click the delete button for first segment
    const deleteButtons = screen.getAllByLabelText(/delete segment/i);
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(deleteButtons[0]);
    expect(mockOnSegmentDelete).toHaveBeenCalledWith(0);
  });

  it("should call onSegmentAdd when add segment button is clicked", () => {
    render(
      <Timeline
        project={mockProject}
        onSegmentUpdate={mockOnSegmentUpdate}
        onSegmentDelete={mockOnSegmentDelete}
        onSegmentAdd={mockOnSegmentAdd}
      />
    );

    const addButton = screen.getByRole("button", { name: /add segment/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(mockOnSegmentAdd).toHaveBeenCalled();
  });
});