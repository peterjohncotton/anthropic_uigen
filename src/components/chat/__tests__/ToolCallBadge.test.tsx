import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("shows 'Creating' action and filename for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/src/components/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating")).toBeDefined();
  expect(screen.getByText("Button.tsx")).toBeDefined();
});

test("shows 'Editing' action and filename for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing")).toBeDefined();
  expect(screen.getByText("App.jsx")).toBeDefined();
});

test("shows 'Editing' action and filename for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing")).toBeDefined();
  expect(screen.getByText("App.jsx")).toBeDefined();
});

test("shows 'Reading' action and filename for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="result"
      result="file contents"
    />
  );
  expect(screen.getByText("Reading")).toBeDefined();
  expect(screen.getByText("App.jsx")).toBeDefined();
});

test("shows 'Renaming' action with both filenames and arrow for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Renaming")).toBeDefined();
  expect(screen.getByText("old.jsx")).toBeDefined();
  expect(screen.getByText("→")).toBeDefined();
  expect(screen.getByText("new.jsx")).toBeDefined();
});

test("shows 'Deleting' action and filename for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/src/unused.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting")).toBeDefined();
  expect(screen.getByText("unused.tsx")).toBeDefined();
});

test("shows spinner when state is call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result with a result value", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Created successfully"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("uses filename only from nested path", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/src/components/ui/button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing")).toBeDefined();
  expect(screen.getByText("button.tsx")).toBeDefined();
});
