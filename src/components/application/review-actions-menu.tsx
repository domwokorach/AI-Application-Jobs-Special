"use client";

import {
  ChevronDown,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getReviewMenuActions, type ReviewMenuAction } from "@/features/applications/utils/review-menu.utils";
import type { ApplicationStatus } from "@/types";

export interface ReviewActionsMenuProps {
  applicationId: string;
  status: ApplicationStatus;

  disabled?: boolean;
  isSaving?: boolean;
  isSubmitting?: boolean;

  onReviewAll?: () => void;
  onDownloadPreview?: () => void;
  onSaveAndExit?: () => void;
  onReturnDashboard?: () => void;
  onViewSubmitted?: () => void;
  onDownloadConfirmation?: () => void;
  onTrackApplication?: () => void;
}

const ACTION_LABEL: Record<ReviewMenuAction, string> = {
  REVIEW_ALL: "Review all sections",
  DOWNLOAD_PREVIEW: "Download / Print preview",
  SAVE_AND_EXIT: "Save and return later",
  RETURN_DASHBOARD: "Return to dashboard",
  VIEW_SUBMITTED: "View submitted application",
  DOWNLOAD_CONFIRMATION: "Download confirmation PDF",
  TRACK_APPLICATION: "Track application",
};

const ACTION_ICON: Record<ReviewMenuAction, React.ComponentType<{ className?: string }>> = {
  REVIEW_ALL: ClipboardCheck,
  DOWNLOAD_PREVIEW: Download,
  SAVE_AND_EXIT: Save,
  RETURN_DASHBOARD: LayoutDashboard,
  VIEW_SUBMITTED: Eye,
  DOWNLOAD_CONFIRMATION: Download,
  TRACK_APPLICATION: ClipboardCheck,
};

export function ReviewActionsMenu({
  applicationId,
  status,
  disabled = false,
  isSaving = false,
  isSubmitting = false,
  onReviewAll,
  onDownloadPreview,
  onSaveAndExit,
  onReturnDashboard,
  onViewSubmitted,
  onDownloadConfirmation,
  onTrackApplication,
}: ReviewActionsMenuProps) {
  void applicationId;

  const handlers: Partial<Record<ReviewMenuAction, () => void>> = {
    REVIEW_ALL: onReviewAll,
    DOWNLOAD_PREVIEW: onDownloadPreview,
    SAVE_AND_EXIT: onSaveAndExit,
    RETURN_DASHBOARD: onReturnDashboard,
    VIEW_SUBMITTED: onViewSubmitted,
    DOWNLOAD_CONFIRMATION: onDownloadConfirmation,
    TRACK_APPLICATION: onTrackApplication,
  };

  const groups = getReviewMenuActions(status);
  // Never render an item whose action isn't actually wired up — a dead menu entry is worse than no entry.
  const primary = groups.primary.filter((action) => Boolean(handlers[action]));
  const secondary = groups.secondary.filter((action) => Boolean(handlers[action]));

  if (primary.length === 0 && secondary.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="More application actions" disabled={disabled} type="button" variant="outline">
          More actions
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        <DropdownMenuLabel>Application actions</DropdownMenuLabel>
        {primary.length > 0 && (
          <DropdownMenuGroup>
            {primary.map((action) => {
              const Icon = ACTION_ICON[action];
              return (
                <DropdownMenuItem key={action} onSelect={handlers[action]}>
                  <Icon className="size-4 shrink-0" />
                  {ACTION_LABEL[action]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}
        {primary.length > 0 && secondary.length > 0 && <DropdownMenuSeparator />}
        {secondary.length > 0 && (
          <DropdownMenuGroup>
            {secondary.map((action) => {
              const Icon = ACTION_ICON[action];
              const itemDisabled = action === "SAVE_AND_EXIT" && isSubmitting;
              return (
                <DropdownMenuItem disabled={itemDisabled} key={action} onSelect={handlers[action]}>
                  <Icon className="size-4 shrink-0" />
                  {action === "SAVE_AND_EXIT" && isSaving ? "Saving…" : ACTION_LABEL[action]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
