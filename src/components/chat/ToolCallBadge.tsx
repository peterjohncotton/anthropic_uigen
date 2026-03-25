"use client";

import { Eye, FilePen, FilePlus, Loader2, MoveRight, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

interface ToolInfo {
  icon: LucideIcon;
  action: string;
  filename: string;
  newFilename?: string;
}

function getToolInfo(toolName: string, args: Record<string, unknown>): ToolInfo {
  const path = (args.path as string) ?? "";
  const filename = path.split("/").pop() || path;
  const command = args.command as string;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return { icon: FilePlus, action: "Creating", filename };
      case "str_replace":
      case "insert":
        return { icon: FilePen, action: "Editing", filename };
      case "view":
        return { icon: Eye, action: "Reading", filename };
      default:
        return { icon: FilePen, action: "Editing", filename };
    }
  }

  if (toolName === "file_manager") {
    const newPath = args.new_path as string | undefined;
    const newFilename = newPath?.split("/").pop() || newPath;
    switch (command) {
      case "rename":
        return { icon: MoveRight, action: "Renaming", filename, newFilename };
      case "delete":
        return { icon: Trash2, action: "Deleting", filename };
    }
  }

  return { icon: FilePen, action: toolName, filename };
}

export function ToolCallBadge({ toolName, args, state, result }: ToolCallBadgeProps) {
  const { icon: Icon, action, filename, newFilename } = getToolInfo(toolName, args);
  const isDone = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <Icon className="w-3 h-3 text-neutral-400 flex-shrink-0" />
      <span className="text-neutral-500">{action}</span>
      <span className="font-medium text-neutral-800">{filename}</span>
      {newFilename && (
        <>
          <span className="text-neutral-400">→</span>
          <span className="font-medium text-neutral-800">{newFilename}</span>
        </>
      )}
    </div>
  );
}
