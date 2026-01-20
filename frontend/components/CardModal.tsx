"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Label, UserRef, Checklist, DueDate, Comment, Card } from "./CardModal/types";
import DescriptionSection from "./CardModal/DescriptionSection";
import ChecklistsSection from "./CardModal/ChecklistsSection";
import ActivitySection from "./CardModal/ActivitySection";
import AddToCardMenu from "./CardModal/AddToCardMenu";
import ActionsMenu from "./CardModal/ActionsMenu";

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

function useSyncedState<T>(source: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(source);

  useEffect(() => {
    setValue(source);
  }, [source]);

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // État pour l'édition du titre
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useSyncedState(card.title);

  // État pour l'édition de la description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useSyncedState(card.description || "");

  // État pour les membres assignés
  const [assignedMembers, setAssignedMembers] = useSyncedState<UserRef[]>(card.assignees || []);

  // État pour les labels assignés
  const [assignedLabels, setAssignedLabels] = useSyncedState<Label[]>(card.labels || []);

  // État pour les checklists
  const [checklists, setChecklists] = useSyncedState<Checklist[]>(card.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  // État pour la date d'échéance
  const [dueDate, setDueDate] = useSyncedState<DueDate | undefined>(card.dueDate);
  const [selectedDate, setSelectedDate] = useState("");

  // État pour les commentaires
  const [comments, setComments] = useSyncedState<Comment[]>(card.comments || []);
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
  }, [isOpen, onClose, isEditingTitle, isEditingDescription, card.title, cancelEditDescription]);

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

  // Fermer en cliquant sur le backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full my-12 animate-fade-scale-in"
        style={{ 
          maxWidth: '768px',
          minWidth: '320px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la modale - fixe */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  {!isEditingTitle ? (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 -mx-2 -my-1 rounded transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                      title="Click to edit title"
                    >
                      {card.title}
                    </h2>
                  ) : (
                    <input
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
                      className="w-full text-xl font-semibold text-gray-900 px-2 py-1 -mx-2 -my-1 border-2 border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label="Edit card title"
                    />
                  )}
                  {listId && (
                    <p className="text-sm text-gray-500 mt-1">
                      in list <span className="underline">List Name</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu de la modale avec scroll vertical interne */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar" style={{ minHeight: 0 }}>
          {/* Layout 2 colonnes */}
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Colonne gauche - Contenu principal (~70%) */}
            <div className="flex-1 lg:w-[70%] space-y-6">
              {/* Labels */}
              {assignedLabels && assignedLabels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {assignedLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label)}
                        className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full text-white ${
                          label.color || "bg-gray-500"
                        } hover:opacity-90 transition-opacity group`}
                        title="Click to remove"
                      >
                        <span>{label.name || "Untitled"}</span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {assignedMembers && assignedMembers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Members</h3>
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
                          className="flex items-center gap-2 bg-gray-100 rounded-full pr-3 hover:bg-gray-200 transition-colors group relative"
                          title={user.name || user.email}
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-medium text-white">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{user.name || user.email}</span>
                          <button
                            onClick={() => toggleMember(user)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 transition-all"
                            aria-label={`Remove ${user.name || user.email}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Due Date */}
              {dueDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Due Date</h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dueDate.isComplete}
                        onChange={toggleDueDateComplete}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          getDueDateStatus(dueDate) === "complete"
                            ? "bg-green-100 text-green-800"
                            : getDueDateStatus(dueDate) === "overdue"
                            ? "bg-red-100 text-red-800"
                            : getDueDateStatus(dueDate) === "soon"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatDueDate(dueDate.date)}
                        {dueDate.isComplete && " (complete)"}
                        {getDueDateStatus(dueDate) === "overdue" && !dueDate.isComplete && " (overdue)"}
                      </div>
                    </label>
                    <button
                      onClick={removeDueDate}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove due date"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">History</h3>
                </div>
                <div className="ml-7">
                  <p className="text-sm text-gray-400 italic">No history available</p>
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
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
          <div className="text-xs text-gray-500">
            Card ID: <span className="font-mono">{card.id}</span>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm animate-fade-in" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full animate-fade-scale-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Archive card?</h3>
              <p className="text-sm text-gray-600 mb-6">
                The card &quot;{card.title}&quot; will be archived. You can restore it later from the board&apos;s archive.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={archiveCard}
                  className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded transition-colors text-sm font-medium"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full animate-fade-scale-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Delete card?</h3>
              <p className="text-sm text-gray-600 mb-6">
                The card &quot;{card.title}&quot; will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteCard}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
