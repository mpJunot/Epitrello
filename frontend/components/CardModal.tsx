"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Label, UserRef, Checklist, DueDate, Comment, Card } from "./CardModal/types";
import DescriptionSection from "./CardModal/DescriptionSection";
import ChecklistsSection from "./CardModal/ChecklistsSection";
import ActivitySection from "./CardModal/ActivitySection";
import AddToCardMenu from "./CardModal/AddToCardMenu";
import ActionsMenu from "./CardModal/ActionsMenu";
import { FileText, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as LabelUI } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Typed event names for board interactions
type BoardEventName =
  | "epitrello:card-title-updated"
  | "epitrello:card-description-updated"
  | "epitrello:card-members-updated"
  | "epitrello:card-labels-updated"
  | "epitrello:card-checklists-updated"
  | "epitrello:card-duedate-updated"
  | "epitrello:card-comments-updated"
  | "epitrello:card-moved"
  | "epitrello:card-copied"
  | "epitrello:card-archived"
  | "epitrello:card-deleted";

// Centralized CustomEvent emitter with logging and error safety
function emitEvent(name: BoardEventName, detail: Record<string, unknown>) {
  try {
    console.log("📤 CardModal:", name, detail);
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch (err) {
    console.error("CardModal: failed to dispatch event", name, err);
  }
}

// Pure helpers (hoisted): formatting + calculations
function getChecklistProgress(checklist: Checklist) {
  if (checklist.items.length === 0) return 0;
  const checkedCount = checklist.items.filter((item) => item.checked).length;
  return Math.round((checkedCount / checklist.items.length) * 100);
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  };
  return date.toLocaleDateString("en-US", options);
}

function formatCommentDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function useSyncedState<T>(source: T, isOpen: boolean, cardId: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const prevIsOpenRef = useRef<boolean>(isOpen);
  const prevCardIdRef = useRef<string | null>(null);

  const [value, setValue] = useState(source);

  useEffect(() => {
    const cardChanged = cardId !== prevCardIdRef.current;
    const modalJustOpened = isOpen && !prevIsOpenRef.current;

    if (cardChanged || modalJustOpened) {
      prevCardIdRef.current = cardId;
      prevIsOpenRef.current = isOpen;
      const timeoutId = setTimeout(() => {
        setValue(source);
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      prevIsOpenRef.current = isOpen;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cardId]);

  return [value, setValue];
}

interface CardModalProps {
  card: Card;
  listId?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CardModal Component - Comprehensive card details editor
 *
 * Closing Mechanisms (1️⃣5️⃣ Fermeture de la modale):
 * 1. Close Button (✕) - Click the button in the top-right
 * 2. Backdrop Click - Click outside the modal on the overlay
 * 3. Escape Key - Press Esc to close (hierarchical handling):
 *    - If editing title: cancel title editing
 *    - Else if editing description: cancel description editing
 *    - Else: close the modal
 *
 * Behaviors on Close:
 * - All saved modifications are preserved (dispatched via CustomEvents)
 * - Board focus is restored to the card element (via cardRef in CardItem)
 * - Body overflow is restored
 * - Modal blur class is removed from board
 * - Focus trap is removed
 *
 * State Management:
 * - All changes (title, description, members, labels, etc.) are managed locally
 * - CustomEvents dispatch changes to parent components
 * - No intermediate saving - changes persist until explicitly reverted via Escape
 */
export default function CardModal({ card, listId, isOpen, onClose }: CardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cardIdRef = useRef<string>(card.id);

  // Reset states when card changes or modal opens
  useEffect(() => {
    if (card.id !== cardIdRef.current) {
      cardIdRef.current = card.id;
    }
  }, [card.id]);

  // État pour l'édition du titre
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useSyncedState(card.title, isOpen, card.id);

  // État pour l'édition de la description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useSyncedState(card.description || "", isOpen, card.id);

  // État pour les membres assignés
  const [assignedMembers, setAssignedMembers] = useSyncedState<UserRef[]>(card.assignees || [], isOpen, card.id);

  // État pour les labels assignés
  const [assignedLabels, setAssignedLabels] = useSyncedState<Label[]>(card.labels || [], isOpen, card.id);

  // État pour les checklists
  const [checklists, setChecklists] = useSyncedState<Checklist[]>(card.checklists || [], isOpen, card.id);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  // État pour la date d'échéance
  const [dueDate, setDueDate] = useSyncedState<DueDate | undefined>(card.dueDate, isOpen, card.id);
  const [selectedDate, setSelectedDate] = useState("");

  // État pour les commentaires
  const [comments, setComments] = useSyncedState<Comment[]>(card.comments || [], isOpen, card.id);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Utilisateur courant simulé
  const currentUser: UserRef = {
    id: "current-user",
    name: "Current User",
    email: "user@example.com",
    avatar: "",
  };

  // Labels disponibles (simulés pour l'instant)
  const availableLabels: Label[] = [
    { id: "label-1", name: "Bug", color: "bg-red-500" },
    { id: "label-2", name: "Feature", color: "bg-green-500" },
    { id: "label-3", name: "Enhancement", color: "bg-yellow-500" },
    { id: "label-4", name: "Documentation", color: "bg-blue-500" },
    { id: "label-5", name: "Urgent", color: "bg-orange-500" },
    { id: "label-6", name: "Design", color: "bg-purple-500" },
  ];

  // Membres disponibles du workspace (simulés pour l'instant)
  const availableMembers: UserRef[] = [
    { id: "1", name: "Alice Martin", email: "alice@example.com", avatar: "" },
    { id: "2", name: "Bob Dupont", email: "bob@example.com", avatar: "" },
    { id: "3", name: "Charlie Bernard", email: "charlie@example.com", avatar: "" },
    { id: "4", name: "Diana Petit", email: "diana@example.com", avatar: "" },
    { id: "5", name: "Eva Moreau", email: "eva@example.com", avatar: "" },
  ];

  // État pour les menus "Add to card"
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // État pour les modales de confirmation et les actions
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Focus sur l'input quand on commence à éditer
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Focus sur le textarea quand on commence à éditer la description
  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [isEditingDescription]);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const menuElement = menuRefs.current[openMenu];

      if (menuElement && !menuElement.contains(target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const cancelEditDescription = useCallback(() => {
    setDescription(card.description || "");
    setIsEditingDescription(false);
  }, [card.description, setDescription]);

  // Gérer la fermeture avec Escape et focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Si on est en train d'éditer le titre, juste annuler l'édition
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTitle(card.title);
        } else if (isEditingDescription) {
          // Si on est en train d'éditer la description, annuler
          cancelEditDescription();
        } else {
          // Sinon, fermer la modale
          onClose();
        }
      }
    };

    // Focus trap: capturer Tab pour rester dans la modale
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: si on est sur le premier élément, aller au dernier
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: si on est sur le dernier élément, aller au premier
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    // Bloquer le scroll du board (on évite de flouter le conteneur pour ne pas rendre la modale floue/inactive)
    document.body.style.overflow = "hidden";

    // Mettre le focus sur le bouton de fermeture au montage UNIQUEMENT
    // Ne pas remettre le focus si on est en train d'éditer
    if (!isEditingTitle && !isEditingDescription) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isEditingTitle, isEditingDescription, card.title, cancelEditDescription, setTitle]);

  // Sauvegarder le titre
  const saveTitle = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      // Ne pas accepter de titre vide : revenir au titre original
      setTitle(card.title);
      setIsEditingTitle(false);
      return;
    }

    // Sauvegarder le nouveau titre
    setIsEditingTitle(false);

    // Notifier le changement (événement custom pour plus tard)
    if (trimmedTitle !== card.title) {
      emitEvent("epitrello:card-title-updated", { cardId: card.id, title: trimmedTitle });
    }
  };

  // Annuler l'édition du titre
  const cancelEditTitle = () => {
    setTitle(card.title);
    setIsEditingTitle(false);
  };

  // Sauvegarder la description
  const saveDescription = () => {
    setIsEditingDescription(false);

    // Notifier le changement
    if (description !== (card.description || "")) {
      emitEvent("epitrello:card-description-updated", { cardId: card.id, description });
    }
  };

  // Toggle menu
  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Ajouter/Supprimer un membre
  const toggleMember = (member: UserRef) => {
    const isAssigned = assignedMembers.some((m) => m.id === member.id);

    const updated = isAssigned
      ? assignedMembers.filter((m) => m.id !== member.id)
      : [...assignedMembers, member];
    setAssignedMembers(updated);
    emitEvent("epitrello:card-members-updated", { cardId: card.id, members: updated });
  };

  // Vérifier si un membre est assigné
  const isMemberAssigned = (memberId: string) => {
    return assignedMembers.some((m) => m.id === memberId);
  };

  // Ajouter/Supprimer un label
  const toggleLabel = (label: Label) => {
    const isAssigned = assignedLabels.some((l) => l.id === label.id);

    const updated = isAssigned
      ? assignedLabels.filter((l) => l.id !== label.id)
      : [...assignedLabels, label];
    setAssignedLabels(updated);
    emitEvent("epitrello:card-labels-updated", { cardId: card.id, labels: updated });
  };

  // Vérifier si un label est assigné
  const isLabelAssigned = (labelId: string) => {
    return assignedLabels.some((l) => l.id === labelId);
  };

  // Créer une checklist
  const createChecklist = () => {
    const title = newChecklistTitle.trim();
    if (!title) return;

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      title,
      items: [],
    };

    const updated = [...checklists, newChecklist];
    setChecklists(updated);
    setNewChecklistTitle("");
    setOpenMenu(null);

    emitEvent("epitrello:card-checklists-updated", { cardId: card.id, checklists: updated });
  };

  // Ajouter un item à une checklist
  const addChecklistItem = (checklistId: string) => {
    const text = newItemText.trim();
    if (!text) return;

    const updated = checklists.map((checklist) => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: [
            ...checklist.items,
            {
              id: `item-${Date.now()}`,
              text,
              checked: false,
            },
          ],
        };
      }
      return checklist;
    });

    setChecklists(updated);
    setNewItemText("");

    emitEvent("epitrello:card-checklists-updated", { cardId: card.id, checklists: updated });
  };

  // Toggle item checklist
  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    const updated = checklists.map((checklist) => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return checklist;
    });

    setChecklists(updated);

    emitEvent("epitrello:card-checklists-updated", { cardId: card.id, checklists: updated });
  };

  // Supprimer une checklist
  const deleteChecklist = (checklistId: string) => {
    const updated = checklists.filter((c) => c.id !== checklistId);
    setChecklists(updated);

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-checklists-updated", {
        detail: { cardId: card.id, checklists: updated },
      })
    );
  };


  // Sauvegarder la date d'échéance
  const saveDueDate = () => {
    if (!selectedDate) return;

    const newDueDate: DueDate = {
      date: selectedDate,
      isComplete: false,
    };

    setDueDate(newDueDate);
    setOpenMenu(null);

    emitEvent("epitrello:card-duedate-updated", { cardId: card.id, dueDate: newDueDate });
  };

  // Toggle complete sur la date
  const toggleDueDateComplete = () => {
    if (!dueDate) return;

    const updated: DueDate = {
      ...dueDate,
      isComplete: !dueDate.isComplete,
    };

    setDueDate(updated);

    emitEvent("epitrello:card-duedate-updated", { cardId: card.id, dueDate: updated });
  };

  // Supprimer la date d'échéance
  const removeDueDate = () => {
    setDueDate(undefined);

    emitEvent("epitrello:card-duedate-updated", { cardId: card.id, dueDate: undefined });
  };

  // Déterminer le statut de la date
  const getDueDateStatus = (dueDate: DueDate) => {
    if (dueDate.isComplete) return "complete";

    const now = new Date();
    const due = new Date(dueDate.date);

    if (due < now) return "overdue";

    // Si dans les prochaines 24h
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (due < tomorrow) return "soon";

    return "upcoming";
  };


  // Ajouter un commentaire
  const addComment = () => {
    const text = newComment.trim();
    if (!text) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };

    const updated = [...comments, comment];
    setComments(updated);
    setNewComment("");

    emitEvent("epitrello:card-comments-updated", { cardId: card.id, comments: updated });
  };

  // Commencer l'édition d'un commentaire
  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  // Sauvegarder l'édition d'un commentaire
  const saveEditComment = (commentId: string) => {
    const text = editingCommentText.trim();
    if (!text) return;

    const updated = comments.map((comment) =>
      comment.id === commentId ? { ...comment, text } : comment
    );

    setComments(updated);
    setEditingCommentId(null);
    setEditingCommentText("");

    emitEvent("epitrello:card-comments-updated", { cardId: card.id, comments: updated });
  };

  // Annuler l'édition
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // Supprimer un commentaire
  const deleteComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);

    emitEvent("epitrello:card-comments-updated", { cardId: card.id, comments: updated });
  };


  // Actions
  const moveCard = () => {
    setShowMoveMenu(!showMoveMenu);
  };

  const moveCardToList = (listName: string) => {
    emitEvent("epitrello:card-moved", { cardId: card.id, toList: listName });
    onClose();
  };

  const copyCard = () => {
    const copiedCard = {
      ...card,
      id: `card-${Date.now()}`,
      title: `${card.title} (copy)`,
    };
    emitEvent("epitrello:card-copied", { cardId: card.id, copiedCard });
    onClose();
  };

  const archiveCard = () => {
    emitEvent("epitrello:card-archived", { cardId: card.id });
    setShowArchiveConfirm(false);
    onClose();
  };

  const deleteCard = () => {
    emitEvent("epitrello:card-deleted", { cardId: card.id });
    setShowDeleteConfirm(false);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          ref={modalRef}
          className="max-w-[768px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{card.title}</DialogTitle>
          <DialogDescription className="sr-only">Card details and actions</DialogDescription>

          <div className="p-6 border-b border-trello-border shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-trello-secondary shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    {!isEditingTitle ? (
                      <h2
                        className="text-xl font-semibold text-trello cursor-pointer hover:bg-trello-hover px-2 py-1 -mx-2 -my-1 rounded transition-colors"
                        onClick={() => setIsEditingTitle(true)}
                        title="Click to edit title"
                      >
                        {card.title}
                      </h2>
                    ) : (
                      <Input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveTitle();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEditTitle();
                          }
                        }}
                        className="w-full text-xl font-semibold text-trello px-2 py-1 -mx-2 -my-1 border-2 border-trello-blue h-auto"
                        aria-label="Edit card title"
                      />
                    )}
                    {listId && (
                      <p className="text-sm text-trello-secondary mt-1">
                        in list <span className="underline">List Name</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar" style={{ minHeight: 0 }}>
          <div className="flex gap-6 flex-col lg:flex-row">
            <div className="flex-1 lg:w-[70%] space-y-6">
              {assignedLabels && assignedLabels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-trello mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {assignedLabels.map((label) => (
                      <Button
                        key={label.id}
                        onClick={() => toggleLabel(label)}
                        variant="ghost"
                        size="sm"
                        className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full text-white ${
                          label.color || "bg-trello-text-secondary"
                        } hover:opacity-90 transition-opacity group`}
                        title="Click to remove"
                      >
                        <span>{label.name || "Untitled"}</span>
                        <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {assignedMembers && assignedMembers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-trello mb-2">Members</h3>
                  <div className="flex flex-wrap gap-2">
                    {assignedMembers.map((user) => {
                      const initials = user.name
                        ? user.name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                        : (user.email || "U")[0].toUpperCase();
                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 bg-trello-hover rounded-full pr-3 hover:bg-trello-border transition-colors group relative"
                          title={user.name || user.email}
                        >
                          <div className="w-8 h-8 rounded-full bg-trello-blue flex items-center justify-center text-xs font-medium text-white">
                            {user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <span className="text-sm text-trello">{user.name || user.email}</span>
                          <Button
                            onClick={() => toggleMember(user)}
                            variant="ghost"
                            size="icon"
                            className="ml-1 opacity-0 group-hover:opacity-100 text-trello-secondary hover:text-red-600 h-auto w-auto p-0"
                            aria-label={`Remove ${user.name || user.email}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Due Date */}
              {dueDate && (
                <div>
                  <h3 className="text-sm font-semibold text-trello mb-2">Due Date</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={dueDate.isComplete}
                        onCheckedChange={toggleDueDateComplete}
                      />
                      <LabelUI className="cursor-pointer">
                        <div
                          className={`px-3 py-1.5 rounded text-sm font-medium ${
                            getDueDateStatus(dueDate) === "complete"
                              ? "bg-green-100 text-green-800"
                              : getDueDateStatus(dueDate) === "overdue"
                              ? "bg-red-100 text-red-800"
                              : getDueDateStatus(dueDate) === "soon"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-trello-hover text-trello"
                          }`}
                        >
                          {formatDueDate(dueDate.date)}
                          {dueDate.isComplete && " (complete)"}
                          {getDueDateStatus(dueDate) === "overdue" && !dueDate.isComplete && " (overdue)"}
                        </div>
                      </LabelUI>
                    </div>
                    <Button
                      onClick={removeDueDate}
                      variant="ghost"
                      size="icon"
                      className="text-trello-text-secondary hover:text-red-600 h-auto w-auto p-0"
                      title="Remove due date"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Description */}
              <DescriptionSection
                cardDescription={card.description}
                isEditing={isEditingDescription}
                description={description}
                onChange={setDescription}
                onStartEdit={() => setIsEditingDescription(true)}
                onSave={saveDescription}
                onCancel={cancelEditDescription}
                textareaRef={descriptionTextareaRef}
              />

              {/* Checklists */}
              <ChecklistsSection
                checklists={checklists}
                addingItemToChecklist={addingItemToChecklist}
                newItemText={newItemText}
                onDeleteChecklist={deleteChecklist}
                onToggleItem={toggleChecklistItem}
                onStartAddItem={(id) => setAddingItemToChecklist(id)}
                onAddItem={addChecklistItem}
                onCancelAddItem={() => {
                  setAddingItemToChecklist(null);
                  setNewItemText("");
                }}
                onChangeNewItemText={setNewItemText}
                getProgress={getChecklistProgress}
              />

              {/* Activity section */}
              <ActivitySection
                currentUser={currentUser}
                comments={comments}
                newComment={newComment}
                onChangeNewComment={setNewComment}
                onAddComment={addComment}
                onStartEditComment={startEditComment}
                editingCommentId={editingCommentId}
                editingCommentText={editingCommentText}
                onEditCommentTextChange={setEditingCommentText}
                onSaveEditComment={saveEditComment}
                onCancelEditComment={cancelEditComment}
                onDeleteComment={deleteComment}
                formatCommentDate={formatCommentDate}
                commentTextareaRef={commentTextareaRef}
              />

              {/* Historique (optionnel) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-trello-secondary" />
                  <h3 className="text-sm font-semibold text-trello">History</h3>
                </div>
                <div className="ml-7">
                  <p className="text-sm text-trello-text-secondary italic">No history available</p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Actions (~30%) */}
            <div className="lg:w-[30%] space-y-4">
              <AddToCardMenu
                openMenu={openMenu}
                toggleMenu={toggleMenu}
                registerMenuRef={(key, el) => { menuRefs.current[key] = el; }}
                availableMembers={availableMembers}
                isMemberAssigned={isMemberAssigned}
                toggleMember={toggleMember}
                availableLabels={availableLabels}
                isLabelAssigned={isLabelAssigned}
                toggleLabel={toggleLabel}
                newChecklistTitle={newChecklistTitle}
                setNewChecklistTitle={setNewChecklistTitle}
                createChecklist={createChecklist}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                dueDate={dueDate}
                saveDueDate={saveDueDate}
                removeDueDate={removeDueDate}
              />

              <ActionsMenu
                showMoveMenu={showMoveMenu}
                onToggleMove={moveCard}
                onMoveCardToList={moveCardToList}
                onCopyCard={copyCard}
                onRequestArchive={() => setShowArchiveConfirm(true)}
                onRequestDelete={() => setShowDeleteConfirm(true)}
              />
            </div>
          </div>
        </div>

          {/* Footer avec actions - fixe */}
          <div className="p-6 border-t border-trello-border bg-trello-hover rounded-b-lg shrink-0">
            <div className="text-xs text-trello-secondary">
              Card ID: <span className="font-mono">{card.id}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Modal */}
      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive card?</DialogTitle>
            <DialogDescription>
              The card &quot;{card.title}&quot; will be archived. You can restore it later from the board&apos;s archive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowArchiveConfirm(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={archiveCard}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete card?</DialogTitle>
            <DialogDescription>
              The card &quot;{card.title}&quot; will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={deleteCard}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
