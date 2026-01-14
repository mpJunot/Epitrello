"use client";

import React, { useEffect, useRef, useState } from "react";

type Label = { id: string; name?: string; color?: string };
type UserRef = { id: string; name?: string; avatar?: string; email?: string };
type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};
type Checklist = {
  id: string;
  title: string;
  items: ChecklistItem[];
};
type DueDate = {
  date: string;
  isComplete: boolean;
};
type Comment = {
  id: string;
  text: string;
  author: UserRef;
  createdAt: string;
};
type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
  checklists?: Checklist[];
  dueDate?: DueDate;
  comments?: Comment[];
};

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
  const [title, setTitle] = useState(card.title);

  // État pour l'édition de la description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(card.description || "");

  // État pour les membres assignés
  const [assignedMembers, setAssignedMembers] = useState<UserRef[]>(card.assignees || []);

  // État pour les labels assignés
  const [assignedLabels, setAssignedLabels] = useState<Label[]>(card.labels || []);

  // État pour les checklists
  const [checklists, setChecklists] = useState<Checklist[]>(card.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  // État pour la date d'échéance
  const [dueDate, setDueDate] = useState<DueDate | undefined>(card.dueDate);
  const [selectedDate, setSelectedDate] = useState("");

  // État pour les commentaires
  const [comments, setComments] = useState<Comment[]>(card.comments || []);
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
  const moveMenuRef = useRef<HTMLDivElement | null>(null);

  // Mettre à jour le titre si la carte change
  useEffect(() => {
    setTitle(card.title);
  }, [card.title]);

  // Mettre à jour la description si la carte change
  useEffect(() => {
    setDescription(card.description || "");
  }, [card.description]);

  // Mettre à jour les membres si la carte change
  useEffect(() => {
    setAssignedMembers(card.assignees || []);
  }, [card.assignees]);

  // Mettre à jour les labels si la carte change
  useEffect(() => {
    setAssignedLabels(card.labels || []);
  }, [card.labels]);

  // Mettre à jour les checklists si la carte change
  useEffect(() => {
    setChecklists(card.checklists || []);
  }, [card.checklists]);

  // Mettre à jour la date d'échéance si la carte change
  useEffect(() => {
    setDueDate(card.dueDate);
  }, [card.dueDate]);

  // Mettre à jour les commentaires si la carte change
  useEffect(() => {
    setComments(card.comments || []);
  }, [card.comments]);

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

    // Mettre le focus sur le bouton de fermeture au montage
    setTimeout(() => closeButtonRef.current?.focus(), 100);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isEditingTitle, isEditingDescription, card.title]);

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
      window.dispatchEvent(
        new CustomEvent("epitrello:card-title-updated", {
          detail: { cardId: card.id, title: trimmedTitle },
        })
      );
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
      window.dispatchEvent(
        new CustomEvent("epitrello:card-description-updated", {
          detail: { cardId: card.id, description },
        })
      );
    }
  };

  // Annuler l'édition de la description
  const cancelEditDescription = () => {
    setDescription(card.description || "");
    setIsEditingDescription(false);
  };

  // Toggle menu
  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Ajouter/Supprimer un membre
  const toggleMember = (member: UserRef) => {
    const isAssigned = assignedMembers.some((m) => m.id === member.id);
    
    if (isAssigned) {
      // Supprimer
      const updated = assignedMembers.filter((m) => m.id !== member.id);
      setAssignedMembers(updated);
      
      // Notifier le changement
      window.dispatchEvent(
        new CustomEvent("epitrello:card-members-updated", {
          detail: { cardId: card.id, members: updated },
        })
      );
    } else {
      // Ajouter
      const updated = [...assignedMembers, member];
      setAssignedMembers(updated);
      
      // Notifier le changement
      window.dispatchEvent(
        new CustomEvent("epitrello:card-members-updated", {
          detail: { cardId: card.id, members: updated },
        })
      );
    }
  };

  // Vérifier si un membre est assigné
  const isMemberAssigned = (memberId: string) => {
    return assignedMembers.some((m) => m.id === memberId);
  };

  // Ajouter/Supprimer un label
  const toggleLabel = (label: Label) => {
    const isAssigned = assignedLabels.some((l) => l.id === label.id);
    
    if (isAssigned) {
      // Supprimer
      const updated = assignedLabels.filter((l) => l.id !== label.id);
      setAssignedLabels(updated);
      
      // Notifier le changement
      window.dispatchEvent(
        new CustomEvent("epitrello:card-labels-updated", {
          detail: { cardId: card.id, labels: updated },
        })
      );
    } else {
      // Ajouter
      const updated = [...assignedLabels, label];
      setAssignedLabels(updated);
      
      // Notifier le changement
      window.dispatchEvent(
        new CustomEvent("epitrello:card-labels-updated", {
          detail: { cardId: card.id, labels: updated },
        })
      );
    }
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-checklists-updated", {
        detail: { cardId: card.id, checklists: updated },
      })
    );
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-checklists-updated", {
        detail: { cardId: card.id, checklists: updated },
      })
    );
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-checklists-updated", {
        detail: { cardId: card.id, checklists: updated },
      })
    );
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

  // Calculer la progression d'une checklist
  const getChecklistProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const checkedCount = checklist.items.filter((item) => item.checked).length;
    return Math.round((checkedCount / checklist.items.length) * 100);
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-duedate-updated", {
        detail: { cardId: card.id, dueDate: newDueDate },
      })
    );
  };

  // Toggle complete sur la date
  const toggleDueDateComplete = () => {
    if (!dueDate) return;

    const updated: DueDate = {
      ...dueDate,
      isComplete: !dueDate.isComplete,
    };

    setDueDate(updated);

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-duedate-updated", {
        detail: { cardId: card.id, dueDate: updated },
      })
    );
  };

  // Supprimer la date d'échéance
  const removeDueDate = () => {
    setDueDate(undefined);

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-duedate-updated", {
        detail: { cardId: card.id, dueDate: undefined },
      })
    );
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

  // Formater la date pour l'affichage
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('en-US', options);
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-comments-updated", {
        detail: { cardId: card.id, comments: updated },
      })
    );
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-comments-updated", {
        detail: { cardId: card.id, comments: updated },
      })
    );
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

    // Notifier le changement
    window.dispatchEvent(
      new CustomEvent("epitrello:card-comments-updated", {
        detail: { cardId: card.id, comments: updated },
      })
    );
  };

  // Formater la date du commentaire
  const formatCommentDate = (dateStr: string) => {
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
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Actions
  const moveCard = () => {
    setShowMoveMenu(!showMoveMenu);
  };

  const moveCardToList = (listName: string) => {
    window.dispatchEvent(
      new CustomEvent("epitrello:card-moved", {
        detail: { cardId: card.id, toList: listName },
      })
    );
    onClose();
  };

  const copyCard = () => {
    const copiedCard = {
      ...card,
      id: `card-${Date.now()}`,
      title: `${card.title} (copy)`,
    };

    window.dispatchEvent(
      new CustomEvent("epitrello:card-copied", {
        detail: { cardId: card.id, copiedCard },
      })
    );
    onClose();
  };

  const archiveCard = () => {
    window.dispatchEvent(
      new CustomEvent("epitrello:card-archived", {
        detail: { cardId: card.id },
      })
    );
    setShowArchiveConfirm(false);
    onClose();
  };

  const deleteCard = () => {
    window.dispatchEvent(
      new CustomEvent("epitrello:card-deleted", {
        detail: { cardId: card.id },
      })
    );
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
                      {title}
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
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">Description</h3>
                </div>
                <div className="ml-7">
                  {!isEditingDescription ? (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className="cursor-pointer"
                    >
                      {card.description ? (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded transition-colors min-h-[80px]">
                          {card.description}
                        </p>
                      ) : (
                        <button className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors w-full text-left min-h-[80px]">
                          Add a more detailed description...
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        ref={descriptionTextareaRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEditDescription();
                          }
                        }}
                        placeholder="Add a more detailed description..."
                        className="w-full min-h-[120px] p-3 rounded border-2 border-indigo-500 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={saveDescription}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditDescription}
                          className="px-4 py-2 text-sm text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklists */}
              {checklists.map((checklist) => {
                const progress = getChecklistProgress(checklist);
                const checkedCount = checklist.items.filter((item) => item.checked).length;
                
                return (
                  <div key={checklist.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700">{checklist.title}</h3>
                      </div>
                      <button
                        onClick={() => deleteChecklist(checklist.id)}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete checklist"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="ml-7">
                      {/* Barre de progression */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            {checkedCount}/{checklist.items.length}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {checklist.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer group transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(checklist.id, item.id)}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span
                              className={`text-sm flex-1 ${
                                item.checked
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-700'
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Add item */}
                      {addingItemToChecklist === checklist.id ? (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addChecklistItem(checklist.id);
                              } else if (e.key === 'Escape') {
                                setAddingItemToChecklist(null);
                                setNewItemText('');
                              }
                            }}
                            placeholder="Add an item..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addChecklistItem(checklist.id)}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setAddingItemToChecklist(null);
                                setNewItemText('');
                              }}
                              className="px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingItemToChecklist(checklist.id)}
                          className="mt-2 text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors"
                        >
                          + Add an item
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Activity section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
                </div>

                {/* Add Comment */}
                <div className="ml-7 mb-4">
                  <div className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name || "User"} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (currentUser.name || "User")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        ref={commentTextareaRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            addComment();
                          }
                        }}
                      />
                      {newComment.trim() && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={addComment}
                            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setNewComment("")}
                            className="px-3 py-1.5 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="ml-7 space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 items-start group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-medium">
                          {comment.author.avatar ? (
                            <img src={comment.author.avatar} alt={comment.author.name || "User"} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (comment.author.name || "User")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author.name || "User"}</span>
                            <span className="text-xs text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                          </div>

                          {editingCommentId === comment.id ? (
                            <div>
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    saveEditComment(comment.id);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    cancelEditComment();
                                  }
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => saveEditComment(comment.id)}
                                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditComment}
                                  className="px-3 py-1.5 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {comment.text}
                            </div>
                          )}

                          {editingCommentId !== comment.id && comment.author.id === currentUser.id && (
                            <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditComment(comment)}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                              >
                                Edit
                              </button>
                              <span className="text-xs text-gray-300">•</span>
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="text-xs text-gray-500 hover:text-red-600 underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Historique (optionnel) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
              {/* Add to card */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Add to card
                </h3>
                <div className="space-y-2">
                  {/* Members */}
                  <div className="relative" ref={(el) => { menuRefs.current['members'] = el; }}>
                    <button
                      onClick={() => toggleMenu('members')}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Members
                    </button>
                    {openMenu === 'members' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Members</h4>
                        <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                          {availableMembers.map((member) => {
                            const initials = member.name
                              ? member.name
                                  .split(" ")
                                  .map((s) => s[0])
                                  .slice(0, 2)
                                  .join("")
                              : (member.email || "U")[0].toUpperCase();
                            const isAssigned = isMemberAssigned(member.id);
                            
                            return (
                              <button
                                key={member.id}
                                onClick={() => toggleMember(member)}
                                className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors ${
                                  isAssigned
                                    ? 'bg-indigo-50 hover:bg-indigo-100'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                                  isAssigned ? 'bg-indigo-500' : 'bg-gray-400'
                                }`}>
                                  {member.avatar ? (
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    initials
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {member.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {member.email}
                                  </div>
                                </div>
                                {isAssigned && (
                                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="relative" ref={(el) => { menuRefs.current['labels'] = el; }}>
                    <button
                      onClick={() => toggleMenu('labels')}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Labels
                    </button>
                    {openMenu === 'labels' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Labels</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                          {availableLabels.map((label) => {
                            const isAssigned = isLabelAssigned(label.id);
                            
                            return (
                              <button
                                key={label.id}
                                onClick={() => toggleLabel(label)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${label.color} text-white text-sm font-medium hover:opacity-90 transition-all ${
                                  isAssigned ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                                }`}
                              >
                                <span className="flex-1 text-left">{label.name || "Untitled"}</span>
                                {isAssigned && (
                                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition-colors">
                            Create new label
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="relative" ref={(el) => { menuRefs.current['checklist'] = el; }}>
                    <button
                      onClick={() => toggleMenu('checklist')}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Checklist
                    </button>
                    {openMenu === 'checklist' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Checklist</h4>
                        <input
                          type="text"
                          value={newChecklistTitle}
                          onChange={(e) => setNewChecklistTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              createChecklist();
                            } else if (e.key === 'Escape') {
                              setOpenMenu(null);
                              setNewChecklistTitle('');
                            }
                          }}
                          placeholder="Checklist title..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                        />
                        <button
                          onClick={createChecklist}
                          className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="relative" ref={(el) => { menuRefs.current['dates'] = el; }}>
                    <button
                      onClick={() => toggleMenu('dates')}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Dates
                    </button>
                    {openMenu === 'dates' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Dates</h4>
                        <label className="block text-xs text-gray-600 mb-1">Due date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
                        />
                        <button
                          onClick={saveDueDate}
                          disabled={!selectedDate}
                          className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                        {dueDate && (
                          <button
                            onClick={removeDueDate}
                            className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Attachment */}
                  <div className="relative" ref={(el) => { menuRefs.current['attachment'] = el; }}>
                    <button
                      onClick={() => toggleMenu('attachment')}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attachment
                    </button>
                    {openMenu === 'attachment' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Attach from...</h4>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
                          Computer
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
                          Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Actions
                </h3>
                <div className="space-y-2">
                  {/* Move Button */}
                  <div className="relative" ref={moveMenuRef}>
                    <button
                      onClick={moveCard}
                      className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Move
                    </button>
                    {showMoveMenu && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Select a list</h4>
                        <div className="space-y-1">
                          {["To Do", "In Progress", "Review", "Done"].map((listName) => (
                            <button
                              key={listName}
                              onClick={() => moveCardToList(listName)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                              {listName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={copyCard}
                    className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>

                  {/* Archive Button */}
                  <button
                    onClick={() => setShowArchiveConfirm(true)}
                    className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archive
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
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
                The card "{card.title}" will be archived. You can restore it later from the board's archive.
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
                The card "{card.title}" will be permanently deleted. This action cannot be undone.
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
