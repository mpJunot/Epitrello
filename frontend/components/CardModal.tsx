'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Label as LabelType,
  UserRef,
  Checklist,
  DueDate,
  Comment,
  Card,
} from './CardModal/types';
import DescriptionSection from './CardModal/DescriptionSection';
import ChecklistsSection from './CardModal/ChecklistsSection';
import { CardModalQuickActions } from './CardModal/CardModalQuickActions';
import { CardModalComments } from './CardModal/CardModalComments';
import { CardModalDates } from './CardModal/CardModalDates';
import { CardModalMembersPopover } from './CardModal/CardModalMembersPopover';
import { Button } from '@/components/ui/button';
import {
  Move,
  X,
  ChevronDown,
  Copy,
  Archive,
  Eye,
  Share2,
  User,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { getLabelDisplayColor } from '@/lib/constants/label-colors';
import { LabelsPopover } from './CardModal/LabelsPopover';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label as LabelComponent } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  addLabelToCard,
  removeLabelFromCard,
  assignMemberToCard,
  unassignMemberFromCard,
  updateCard,
} from '@/lib/actions/cards';
import {
  createChecklist as createChecklistAPI,
  deleteChecklist as deleteChecklistAPI,
  addChecklistItem as addChecklistItemAPI,
  updateChecklistItem as updateChecklistItemAPI,
  deleteChecklistItem as deleteChecklistItemAPI,
} from '@/lib/actions/checklists';
import { boardQueryKey, useBoardQuery } from '@/app/boards/[id]/queries';
import { useWorkspaceQuery } from '@/lib/queries/workspaces';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { toast } from '@/lib/toast';
import {
  emitEvent,
  formatCommentDate,
  getChecklistProgress,
} from './CardModal/utils';
import { useSyncedState } from './CardModal/hooks/useSyncedState';
import { BACKGROUND_COLORS } from './CardModal/constants';
import { BoardMember } from '@/app/boards/[id]/types';

// Move Card Content Component
function MoveCardContent({
  selectedBoardId,
  setSelectedBoardId,
  selectedListId,
  setSelectedListId,
  selectedPosition,
  setSelectedPosition,
  availableLists,
  availableBoards,
  currentBoardId,
  handleMoveCard,
  setIsMovePopoverOpen,
}: {
  selectedBoardId: string;
  setSelectedBoardId: (id: string) => void;
  selectedListId: string;
  setSelectedListId: (id: string) => void;
  selectedPosition: string;
  setSelectedPosition: (pos: string) => void;
  availableLists: Array<{ id: string; name: string }>;
  availableBoards?: Array<{
    id: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
  }>;
  currentBoardId?: string;
  handleMoveCard: () => void;
  setIsMovePopoverOpen: (open: boolean) => void;
}) {
  return (
    <>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Move card</h3>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => setIsMovePopoverOpen(false)}
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>
      <div className='space-y-4'>
        <div>
          <LabelComponent
            htmlFor='board-select'
            className='text-sm font-medium mb-2 block'
          >
            Select destination
          </LabelComponent>
          <div className='space-y-4'>
            <div>
              <LabelComponent
                htmlFor='board'
                className='text-xs text-muted-foreground mb-1 block'
              >
                Board
              </LabelComponent>
              <Select
                value={selectedBoardId}
                onValueChange={setSelectedBoardId}
              >
                <SelectTrigger id='board' className='w-full'>
                  <SelectValue placeholder='Select a board' />
                </SelectTrigger>
                <SelectContent className='border-accent'>
                  {availableBoards && availableBoards.length > 0 ? (
                    (() => {
                      // Group boards by workspace
                      const boardsByWorkspace = availableBoards.reduce(
                        (acc, board) => {
                          if (!acc[board.workspaceId]) {
                            acc[board.workspaceId] = {
                              workspaceName: board.workspaceName,
                              boards: [],
                            };
                          }
                          acc[board.workspaceId].boards.push(board);
                          return acc;
                        },
                        {} as Record<
                          string,
                          {
                            workspaceName: string;
                            boards: typeof availableBoards;
                          }
                        >,
                      );

                      const workspaceEntries =
                        Object.entries(boardsByWorkspace);
                      return workspaceEntries.map(
                        ([workspaceId, { workspaceName, boards }], index) => (
                          <SelectGroup key={workspaceId}>
                            <SelectLabel className='text-xs font-semibold text-muted-foreground px-2 py-1.5'>
                              {workspaceName}
                            </SelectLabel>
                            {boards.map((board) => (
                              <SelectItem
                                key={board.id}
                                value={board.id}
                                className='pl-6'
                              >
                                {board.name}
                              </SelectItem>
                            ))}
                            {index < workspaceEntries.length - 1 && (
                              <SelectSeparator />
                            )}
                          </SelectGroup>
                        ),
                      );
                    })()
                  ) : currentBoardId ? (
                    <SelectItem value={currentBoardId}>
                      Current Board
                    </SelectItem>
                  ) : (
                    <SelectItem value='' disabled>
                      No boards available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <LabelComponent
                  htmlFor='list'
                  className='text-xs text-muted-foreground mb-1 block'
                >
                  List
                </LabelComponent>
                <Select
                  value={selectedListId}
                  onValueChange={setSelectedListId}
                >
                  <SelectTrigger id='list' className='w-full'>
                    <SelectValue placeholder='Select a list' />
                  </SelectTrigger>
                  <SelectContent className='border-accent'>
                    {availableLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-24'>
                <LabelComponent
                  htmlFor='position'
                  className='text-xs text-muted-foreground mb-1 block'
                >
                  Position
                </LabelComponent>
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger id='position' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-accent'>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
                      <SelectItem key={pos} value={pos.toString()}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 flex justify-start'>
          <Button
            onClick={() => {
              handleMoveCard();
              setIsMovePopoverOpen(false);
            }}
            disabled={!selectedBoardId || !selectedListId}
            size='sm'
          >
            Move
          </Button>
        </div>
      </div>
    </>
  );
}

interface CardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  currentBoardId?: string;
  availableLists?: Array<{ id: string; name: string }>;
  availableBoards?: Array<{
    id: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
  }>;
  /** When true, user can only view (e.g. observer or non-member). No edit/delete/move. */
  readOnly?: boolean;
}

export default function CardModal({
  card,
  isOpen,
  onClose,
  currentBoardId,
  availableLists = [],
  availableBoards = [],
  readOnly = false,
}: CardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cardIdRef = useRef<string>(card.id);
  const queryClient = useQueryClient();

  const currentList = availableLists.find((list) => list.id === card.listId);
  const currentListName = currentList?.name || 'List';

  useEffect(() => {
    if (card.id !== cardIdRef.current) {
      cardIdRef.current = card.id;
    }
  }, [card.id]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useSyncedState(card.title, isOpen, card.id);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useSyncedState(
    card.description ?? '',
    isOpen,
    card.id,
  );

  const [assignedMembers, setAssignedMembers] = useSyncedState<UserRef[]>(
    card.assignees || [],
    isOpen,
    card.id,
  );

  const [assignedLabels, setAssignedLabels] = useSyncedState<LabelType[]>(
    card.labels || [],
    isOpen,
    card.id,
  );

  const [checklists, setChecklists] = useSyncedState<Checklist[]>(
    card.checklists || [],
    isOpen,
    card.id,
  );
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<
    string | null
  >(null);
  const [newItemText, setNewItemText] = useState('');

  const [dueDate, setDueDate] = useSyncedState<DueDate | undefined>(
    card.dueDate ? { date: card.dueDate, isComplete: false } : undefined,
    isOpen,
    card.id,
  );
  const [selectedDate, setSelectedDate] = useState('');

  const [startDate, setStartDate] = useSyncedState<string | undefined>(
    card.startDate || undefined,
    isOpen,
    card.id,
  );
  const [selectedStartDate, setSelectedStartDate] = useState('');

  const [comments, setComments] = useSyncedState<Comment[]>(
    card.comments || [],
    isOpen,
    card.id,
  );
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [background, setBackground] = useSyncedState<string | undefined>(
    card.background || undefined,
    isOpen,
    card.id,
  );

  const [headerBackground, setHeaderBackground] = useState<string | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  useEffect(() => {
    if (
      background &&
      !background.startsWith('data:image') &&
      !background.startsWith('http') &&
      !background.startsWith('https')
    ) {
      const isColor = BACKGROUND_COLORS.some((c) => c.value === background);
      if (isColor) {
        const timeoutId = setTimeout(() => {
          setHeaderBackground(background);
        }, 0);
        return () => clearTimeout(timeoutId);
      } else {
        const timeoutId = setTimeout(() => {
          setHeaderBackground(null);
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    } else if (!background) {
      const timeoutId = setTimeout(() => {
        setHeaderBackground(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [background]);

  const { data: currentUserData } = useCurrentUserQuery();
  const currentUser: UserRef = useMemo(
    () =>
      currentUserData
        ? {
            id: currentUserData.id,
            name: currentUserData.name ?? '',
            email: currentUserData.email ?? '',
            avatar: currentUserData.avatar ?? undefined,
          }
        : { id: '', name: '', email: '', avatar: undefined },
    [currentUserData],
  );

  const { data: boardData } = useBoardQuery(
    currentBoardId && isOpen ? currentBoardId : '',
  );

  const workspaceId = boardData?.workspaceId;
  const { data: workspaceData } = useWorkspaceQuery(
    workspaceId && isOpen ? workspaceId : '',
  );

  const availableMembers: (UserRef & {
    workspaceName?: string;
    workspaceId?: string;
  })[] = useMemo(() => {
    if (!boardData?.members || !isOpen) return [];

    const workspaceName = workspaceData?.name || 'Board Members';
    const wsId = boardData.workspaceId || 'default';

    return boardData.members.map((member: BoardMember) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,

      avatar: member.user.avatar || undefined,
      workspaceName,
      workspaceId: wsId,
    }));
  }, [boardData, workspaceData, isOpen]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const menuElement = menuRefs.current[openMenu];

      if (menuElement && !menuElement.contains(target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  const cancelEditDescription = useCallback(() => {
    setDescription(card.description || '');
    setIsEditingDescription(false);
  }, [card.description, setDescription]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTitle(card.title);
        } else if (isEditingDescription) {
          cancelEditDescription();
        } else {
          onClose();
        }
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    document.body.style.overflow = 'hidden';

    if (!isEditingTitle && !isEditingDescription) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';
    };
  }, [
    isOpen,
    onClose,
    isEditingTitle,
    isEditingDescription,
    card.title,
    cancelEditDescription,
    setTitle,
  ]);

  const saveTitle = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitle(card.title);
      setIsEditingTitle(false);
      return;
    }

    setIsEditingTitle(false);

    if (trimmedTitle !== card.title) {
      emitEvent('epitrello:card-title-updated', {
        cardId: card.id,
        title: trimmedTitle,
      });
    }
  };

  const cancelEditTitle = () => {
    setTitle(card.title);
    setIsEditingTitle(false);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);

    if (description !== (card.description || '')) {
      emitEvent('epitrello:card-description-updated', {
        cardId: card.id,
        description,
      });
    }
  };

  const toggleMenu = (menuName: string) => {
    if (openMenu === menuName) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuName);
      if (menuName === 'dueDate') {
        if (dueDate) {
          setSelectedDate(dueDate.date);
        } else {
          setSelectedDate('');
        }
        if (startDate) {
          setSelectedStartDate(startDate);
        } else {
          setSelectedStartDate('');
        }
      }
    }
  };

  const toggleMember = async (member: UserRef) => {
    const isAssigned = assignedMembers.some((m) => m.id === member.id);

    const updated = isAssigned
      ? assignedMembers.filter((m) => m.id !== member.id)
      : [...assignedMembers, member];

    try {
      if (isAssigned) {
        await unassignMemberFromCard({ cardId: card.id, userId: member.id });
      } else {
        await assignMemberToCard({ cardId: card.id, userId: member.id });
      }
      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }
      setAssignedMembers(updated);
      emitEvent('epitrello:card-members-updated', {
        cardId: card.id,
        members: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update member',
      );
    }
  };

  const toggleLabel = async (label: LabelType) => {
    const isAssigned = assignedLabels.some((l) => l.id === label.id);
    const updated = isAssigned
      ? assignedLabels.filter((l) => l.id !== label.id)
      : [...assignedLabels, label];

    try {
      if (isAssigned) {
        await removeLabelFromCard({ cardId: card.id, labelId: label.id });
      } else {
        await addLabelToCard({ cardId: card.id, labelId: label.id });
      }
      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }
      setAssignedLabels(updated);
      emitEvent('epitrello:card-labels-updated', {
        cardId: card.id,
        labels: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update label',
      );
    }
  };

  const createChecklist = async () => {
    const title = newChecklistTitle.trim();
    if (!title) return;

    try {
      const newChecklistAPI = await createChecklistAPI({
        cardId: card.id,
        title,
      });

      const mappedItems = (newChecklistAPI.items || []).map((item) => ({
        ...item,
        text: item.content,
      }));

      const newChecklist: Checklist = {
        id: newChecklistAPI.id,
        title: newChecklistAPI.title,
        cardId: newChecklistAPI.cardId,
        items: mappedItems,
      };

      const updated = [...checklists, newChecklist];
      setChecklists(updated);
      setNewChecklistTitle('');
      setOpenMenu(null);

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      emitEvent('epitrello:card-checklists-updated', {
        cardId: card.id,
        checklists: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create checklist',
      );
    }
  };

  const addChecklistItem = async (checklistId: string) => {
    const text = newItemText.trim();
    if (!text) return;

    try {
      const newItem = await addChecklistItemAPI({
        checklistId,
        content: text,
      });

      const mappedItem = {
        ...newItem,
        text: newItem.content,
      };

      const updated = checklists.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            items: [...(checklist.items || []), mappedItem],
          };
        }
        return checklist;
      });

      setChecklists(updated);
      setNewItemText('');

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      emitEvent('epitrello:card-checklists-updated', {
        cardId: card.id,
        checklists: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to add checklist item',
      );
    }
  };

  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    const checklist = checklists.find((c) => c.id === checklistId);
    const item = checklist?.items?.find((i) => i.id === itemId);
    if (!item) return;

    const newChecked = !item.checked;

    try {
      await updateChecklistItemAPI({
        id: itemId,
        checked: newChecked,
      });

      const updated = checklists.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            items: (checklist.items || []).map((item) => ({
              ...item,
              text: item.content,
              checked: item.id === itemId ? newChecked : item.checked,
            })),
          };
        }
        return checklist;
      });

      setChecklists(updated);

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      emitEvent('epitrello:card-checklists-updated', {
        cardId: card.id,
        checklists: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update checklist item',
      );
    }
  };

  const deleteChecklist = async (checklistId: string) => {
    try {
      await deleteChecklistAPI(checklistId);

      const updated = checklists.filter((c) => c.id !== checklistId);
      setChecklists(updated);

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      window.dispatchEvent(
        new CustomEvent('epitrello:card-checklists-updated', {
          detail: { cardId: card.id, checklists: updated },
        }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete checklist',
      );
    }
  };

  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      await deleteChecklistItemAPI(itemId);

      const updated = checklists.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            items: (checklist.items || []).filter((item) => item.id !== itemId),
          };
        }
        return checklist;
      });

      setChecklists(updated);

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      emitEvent('epitrello:card-checklists-updated', {
        cardId: card.id,
        checklists: updated,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete checklist item',
      );
    }
  };

  const saveDueDate = (date?: string) => {
    const dateToUse = date ?? selectedDate;
    if (!dateToUse) return;

    const newDueDate: DueDate = {
      date: dateToUse,
      isComplete: false,
    };

    setDueDate(newDueDate);
    setOpenMenu(null);

    emitEvent('epitrello:card-duedate-updated', {
      cardId: card.id,
      dueDate: newDueDate,
    });
  };

  const removeDueDate = () => {
    setDueDate(undefined);

    emitEvent('epitrello:card-duedate-updated', {
      cardId: card.id,
      dueDate: undefined,
    });
  };

  const saveStartDate = (date?: string) => {
    const dateToUse = date ?? selectedStartDate;
    if (!dateToUse) return;

    setStartDate(dateToUse);
    setOpenMenu(null);

    emitEvent('epitrello:card-startdate-updated', {
      cardId: card.id,
      startDate: dateToUse,
    });
  };

  const removeStartDate = () => {
    setStartDate(undefined);
    setOpenMenu(null);

    emitEvent('epitrello:card-startdate-updated', {
      cardId: card.id,
      startDate: undefined,
    });
  };

  const saveBackground = async (url: string) => {
    if (!url.trim()) return;

    try {
      await updateCard({ id: card.id, background: url.trim() });

      setBackground(url.trim());

      const isColor = BACKGROUND_COLORS.some((c) => c.value === url.trim());
      if (isColor) {
        setHeaderBackground(url.trim());
      } else {
        setHeaderBackground(null);
      }

      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }

      emitEvent('epitrello:card-background-updated', {
        cardId: card.id,
        background: url.trim(),
      });

      toast.success('Background updated successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update background',
      );
    }
  };

  const removeBackground = async () => {
    try {
      await updateCard({ id: card.id, background: null });
      if (currentBoardId) {
        await queryClient.invalidateQueries({
          queryKey: boardQueryKey(currentBoardId),
        });
      }
      setBackground(undefined);
      setHeaderBackground(null);
      emitEvent('epitrello:card-background-updated', {
        cardId: card.id,
        background: null,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove background',
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        saveBackground(base64);
        setHeaderBackground(null);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const addComment = () => {
    const text = newComment.trim();
    if (!text) return;
    if (!currentUser.id) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };

    const updated = [...comments, comment];
    setComments(updated);
    setNewComment('');

    emitEvent('epitrello:card-comments-updated', {
      cardId: card.id,
      comments: updated,
    });
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const saveEditComment = (commentId: string) => {
    const text = editingCommentText.trim();
    if (!text) return;

    const updated = comments.map((comment) =>
      comment.id === commentId ? { ...comment, text } : comment,
    );

    setComments(updated);
    setEditingCommentId(null);
    setEditingCommentText('');

    emitEvent('epitrello:card-comments-updated', {
      cardId: card.id,
      comments: updated,
    });
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const deleteComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);

    emitEvent('epitrello:card-comments-updated', {
      cardId: card.id,
      comments: updated,
    });
  };

  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    currentBoardId || card.listId || '',
  );
  const [selectedListId, setSelectedListId] = useState<string>(
    card.listId || '',
  );
  const [selectedPosition, setSelectedPosition] = useState<string>('1');
  // Menu de déplacement dans le header
  const [isHeaderMoveOpen, setIsHeaderMoveOpen] = useState(false);
  // Popover de déplacement utilisé dans la section Dates (overdue)
  const [isMovePopoverOpen, setIsMovePopoverOpen] = useState(false);

  const handleMoveCard = () => {
    if (selectedBoardId && selectedListId) {
      emitEvent('epitrello:card-move', {
        cardId: card.id,
        sourceListId: card.listId,
        targetListId: selectedListId,
        targetIndex: parseInt(selectedPosition, 10) - 1,
        fromIndex: card.position,
      });
    }
  };

  const copyCard = () => {
    const copiedCard = {
      ...card,
      id: `card-${Date.now()}`,
      title: `${card.title} (copy)`,
    };
    emitEvent('epitrello:card-copied', { cardId: card.id, copiedCard });
    onClose();
  };

  const archiveCard = () => {
    emitEvent('epitrello:card-archived', { cardId: card.id });
    setShowArchiveConfirm(false);
    onClose();
  };

  const deleteCard = () => {
    emitEvent('epitrello:card-deleted', { cardId: card.id });
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const isImageHeaderBackground =
    !!background &&
    (background.startsWith('data:image') ||
      background.startsWith('http') ||
      background.startsWith('https'));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          ref={modalRef}
          className='sm:max-w-5xl w-full p-0 overflow-hidden max-h-[calc(100vh-200px)] flex flex-col'
          showCloseButton={false}
        >
          <DialogHeader className='px-6 pt-4 pb-2 h-30  border-b border-accent relative overflow-visible'>
            <div
              className={`absolute inset-0 -z-10 ${
                !isImageHeaderBackground
                  ? background &&
                    BACKGROUND_COLORS.some((c) => c.value === background)
                    ? background
                    : headerBackground
                      ? headerBackground
                      : 'bg-background'
                  : 'bg-background'
              }`}
              style={
                isImageHeaderBackground
                  ? {
                      backgroundImage: `url(${background})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }
                  : undefined
              }
            />
            <DialogTitle className='sr-only'>Card Details</DialogTitle>
            <DialogDescription className='sr-only'>
              View and edit card details, including description, checklists,
              comments, and attachments.
            </DialogDescription>

            <div className='flex items-center justify-between gap-2 min-w-0'>
              <div className='flex items-center gap-2 min-w-0 overflow-visible'>
                {readOnly ? (
                  <span className='text-sm font-medium text-trello px-2 py-1.5 rounded-full bg-trello-hover truncate max-w-40'>
                    {currentListName}
                  </span>
                ) : (
                  <Popover
                    open={isHeaderMoveOpen}
                    onOpenChange={setIsHeaderMoveOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='secondary'
                        size='sm'
                        className='flex items-center gap-1 min-w-0 bg-trello-hover text-trello px-3 py-1.5 rounded-full cursor-pointer hover:bg-trello-border border-none shadow-none'
                      >
                        <span className='text-sm font-medium truncate max-w-40'>
                          {currentListName}
                        </span>
                        <ChevronDown className='w-4 h-4 shrink-0' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align='start'
                      className='w-80 p-4 border-accent bg-trello-card-bg'
                    >
                      <MoveCardContent
                        selectedBoardId={selectedBoardId}
                        setSelectedBoardId={setSelectedBoardId}
                        selectedListId={selectedListId}
                        setSelectedListId={setSelectedListId}
                        selectedPosition={selectedPosition}
                        setSelectedPosition={setSelectedPosition}
                        availableLists={availableLists}
                        availableBoards={availableBoards}
                        currentBoardId={currentBoardId}
                        handleMoveCard={handleMoveCard}
                        setIsMovePopoverOpen={setIsHeaderMoveOpen}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                {!readOnly && (
                  <Popover
                    open={showBackgroundPicker}
                    onOpenChange={setShowBackgroundPicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-trello-secondary hover:bg-trello-hover'
                      >
                        <ImageIcon className='w-4 h-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align='end'
                      className='w-80 p-4 border-accent bg-trello-card-bg'
                    >
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-lg font-semibold'>
                            Change background
                          </h3>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => setShowBackgroundPicker(false)}
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        </div>
                        <div className='space-y-4'>
                          <div className='space-y-2'>
                            <div className='text-sm font-medium'>
                              Upload Image
                            </div>
                            <div className='flex items-center gap-2'>
                              <Input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                                className='flex-1'
                                id='background-image-upload-header'
                              />
                              <LabelComponent
                                htmlFor='background-image-upload-header'
                                className='cursor-pointer'
                              >
                                <Button variant='outline' size='sm' asChild>
                                  <span>Choose File</span>
                                </Button>
                              </LabelComponent>
                            </div>
                          </div>
                          <div className='space-y-2'>
                            <div className='text-sm font-medium'>Colors</div>
                            <div className='grid grid-cols-4 gap-2'>
                              {BACKGROUND_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={async () => {
                                    setHeaderBackground(color.value);
                                    await saveBackground(color.value);
                                    setShowBackgroundPicker(false);
                                  }}
                                  className={`h-12 rounded-lg ${color.value} border-2 transition-all ${
                                    (headerBackground === color.value ||
                                      background === color.value) &&
                                    !background?.startsWith('data:image')
                                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                                      : 'border-transparent hover:border-accent'
                                  }`}
                                  title={color.label}
                                />
                              ))}
                            </div>
                            {(background || headerBackground) && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='w-full'
                                onClick={() => {
                                  if (background) {
                                    removeBackground();
                                  } else {
                                    setHeaderBackground(null);
                                  }
                                  setShowBackgroundPicker(false);
                                }}
                              >
                                Remove background
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {!readOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-trello-secondary hover:bg-trello-hover'
                      >
                        <MoreHorizontal className='w-4 h-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      className='border-accent bg-trello-card-bg'
                    >
                      <DropdownMenuItem>
                        <User className='w-4 h-4 mr-2' />
                        Leave
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsMovePopoverOpen(true)}
                      >
                        <Move className='w-4 h-4 mr-2' />
                        Move
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyCard}>
                        <Copy className='w-4 h-4 mr-2' />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className='w-4 h-4 mr-2' />
                        Watch
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className='w-4 h-4 mr-2' />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowArchiveConfirm(true)}
                      >
                        <Archive className='w-4 h-4 mr-2' />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DialogClose asChild>
                  <Button
                    ref={closeButtonRef}
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-trello-secondary hover:bg-trello-hover'
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          <div className='flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden'>
            <div className='flex-1 lg:w-[60%] px-6 pt-4 pb-4 overflow-y-auto custom-scrollbar'>
              <div className='flex items-start gap-3 mb-6'>
                <Checkbox
                  checked={card.completed ?? false}
                  onCheckedChange={
                    readOnly
                      ? undefined
                      : (checked) => {
                          window.dispatchEvent(
                            new CustomEvent(
                              'epitrello:card-completed-updated',
                              {
                                detail: {
                                  cardId: card.id,
                                  completed: checked as boolean,
                                },
                              },
                            ),
                          );
                        }
                  }
                  disabled={readOnly}
                  className='mt-1.5 w-5 h-5'
                />
                <div className='flex-1 min-w-0'>
                  {readOnly ? (
                    <h2 className='text-2xl font-bold text-foreground px-2 py-1 -mx-2 -my-1'>
                      {title || card.title}
                    </h2>
                  ) : !isEditingTitle ? (
                    <h2
                      className='text-2xl font-bold text-foreground cursor-pointer hover:bg-accent/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors'
                      onClick={() => setIsEditingTitle(true)}
                      title='Click to edit title'
                    >
                      {title || card.title}
                    </h2>
                  ) : (
                    <Input
                      ref={titleInputRef}
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveTitle();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEditTitle();
                        }
                      }}
                      className='w-full text-2xl font-bold text-foreground px-2 py-1 -mx-2 -my-1 border border-accent h-auto'
                      aria-label='Edit card title'
                    />
                  )}
                </div>
              </div>

              <div className='mb-6'>
                <CardModalQuickActions
                  availableMembers={availableMembers}
                  assignedMembers={assignedMembers}
                  assignedLabels={assignedLabels}
                  boardId={currentBoardId ?? ''}
                  dueDate={dueDate}
                  startDate={startDate}
                  selectedDate={selectedDate}
                  selectedStartDate={selectedStartDate}
                  newChecklistTitle={newChecklistTitle}
                  onToggleMenu={toggleMenu}
                  onToggleMember={toggleMember}
                  onToggleLabel={toggleLabel}
                  onSetSelectedDate={setSelectedDate}
                  onSetSelectedStartDate={setSelectedStartDate}
                  onSaveDueDate={saveDueDate}
                  onRemoveDueDate={removeDueDate}
                  onSaveStartDate={saveStartDate}
                  onRemoveStartDate={removeStartDate}
                  onSetNewChecklistTitle={setNewChecklistTitle}
                  onCreateChecklist={createChecklist}
                  readOnly={readOnly}
                />
              </div>

              {(assignedMembers.length > 0 ||
                assignedLabels.length > 0 ||
                startDate ||
                dueDate) && (
                <div className='mb-6 space-y-4'>
                  {(assignedMembers.length > 0 ||
                    assignedLabels.length > 0) && (
                    <div className='flex flex-wrap gap-x-6 gap-y-4 items-start'>
                      {assignedMembers.length > 0 && (
                        <div>
                          <h3 className='text-sm font-semibold text-trello mb-2'>
                            Members
                          </h3>
                          <AvatarGroup className='flex-row flex-wrap'>
                            {assignedMembers.map((member) => {
                              const displayName =
                                member.name || member.email || 'U';
                              const avatarColor = getAvatarColor(displayName);
                              return (
                                <Avatar
                                  key={member.id}
                                  size='default'
                                  title={member.name || member.email}
                                  className={`shrink-0 ${avatarColor}`}
                                >
                                  <AvatarImage
                                    src={member.avatar ?? undefined}
                                    alt={displayName}
                                    className='object-cover'
                                  />
                                  <AvatarFallback
                                    className={`text-xs font-medium text-white ${avatarColor}`}
                                  >
                                    {getInitials(member.name, member.email)}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {!readOnly && (
                              <CardModalMembersPopover
                                availableMembers={availableMembers}
                                assignedMembers={assignedMembers}
                                onToggleMember={toggleMember}
                                trigger={
                                  <AvatarGroupCount className='cursor-pointer hover:bg-trello-blue bg-trello-blue-light text-white'>
                                    <Plus className='w-4 h-4' />
                                  </AvatarGroupCount>
                                }
                              />
                            )}
                          </AvatarGroup>
                        </div>
                      )}

                      {assignedLabels.length > 0 && (
                        <div>
                          <h3 className='text-sm font-semibold text-trello mb-2'>
                            Labels
                          </h3>
                          <div className='flex flex-wrap items-center gap-2'>
                            {assignedLabels.map((label) => (
                              <span
                                key={label.id}
                                role={readOnly ? undefined : 'button'}
                                onClick={
                                  readOnly
                                    ? undefined
                                    : () => toggleLabel(label)
                                }
                                className={`inline-block text-xs px-2 py-0.5 rounded shrink-0 text-white ${!readOnly ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                style={{
                                  backgroundColor: getLabelDisplayColor(
                                    label.color,
                                  ),
                                }}
                                title={label.name || 'Untitled'}
                              >
                                {label.name || 'Untitled'}
                              </span>
                            ))}
                            {!readOnly && (
                              <LabelsPopover
                                boardId={currentBoardId ?? ''}
                                assignedLabels={assignedLabels}
                                onToggleLabel={toggleLabel}
                                trigger={
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='w-8 h-8 shrink-0 rounded-full bg-trello-hover hover:bg-trello-border text-trello-secondary'
                                  >
                                    <Plus className='w-4 h-4' />
                                  </Button>
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(startDate || dueDate) && (
                    <CardModalDates
                      startDate={startDate}
                      dueDate={dueDate}
                      selectedStartDate={selectedStartDate}
                      selectedDate={selectedDate}
                      onSetSelectedStartDate={setSelectedStartDate}
                      onSetSelectedDate={setSelectedDate}
                      onSaveStartDate={saveStartDate}
                      onRemoveStartDate={removeStartDate}
                      onSaveDueDate={saveDueDate}
                      onRemoveDueDate={removeDueDate}
                      isMovePopoverOpen={isMovePopoverOpen}
                      onMovePopoverOpenChange={setIsMovePopoverOpen}
                      readOnly={readOnly}
                      moveCardContent={
                        <MoveCardContent
                          selectedBoardId={selectedBoardId}
                          setSelectedBoardId={setSelectedBoardId}
                          selectedListId={selectedListId}
                          setSelectedListId={setSelectedListId}
                          selectedPosition={selectedPosition}
                          setSelectedPosition={setSelectedPosition}
                          availableLists={availableLists}
                          availableBoards={availableBoards}
                          currentBoardId={currentBoardId}
                          handleMoveCard={handleMoveCard}
                          setIsMovePopoverOpen={setIsMovePopoverOpen}
                        />
                      }
                    />
                  )}
                </div>
              )}

              <div className='space-y-6'>
                <DescriptionSection
                  cardDescription={card.description ?? undefined}
                  isEditing={isEditingDescription}
                  description={description}
                  onChange={setDescription}
                  onStartEdit={() => setIsEditingDescription(true)}
                  onSave={saveDescription}
                  onCancel={cancelEditDescription}
                  textareaRef={descriptionTextareaRef}
                  readOnly={readOnly}
                />

                <ChecklistsSection
                  checklists={checklists}
                  addingItemToChecklist={addingItemToChecklist}
                  newItemText={newItemText}
                  onDeleteChecklist={deleteChecklist}
                  onDeleteItem={deleteChecklistItem}
                  onToggleItem={toggleChecklistItem}
                  onStartAddItem={(id) => setAddingItemToChecklist(id)}
                  onAddItem={addChecklistItem}
                  onCancelAddItem={() => {
                    setAddingItemToChecklist(null);
                    setNewItemText('');
                  }}
                  onChangeNewItemText={setNewItemText}
                  getProgress={getChecklistProgress}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className='hidden lg:block w-px bg-accent' />
            <div className='lg:w-[40%] overflow-y-auto custom-scrollbar'>
              <CardModalComments
                comments={comments}
                newComment={newComment}
                editingCommentId={editingCommentId}
                editingCommentText={editingCommentText}
                commentTextareaRef={commentTextareaRef}
                onChangeNewComment={setNewComment}
                onAddComment={addComment}
                onStartEditComment={startEditComment}
                onEditCommentTextChange={setEditingCommentText}
                onSaveEditComment={saveEditComment}
                onCancelEditComment={cancelEditComment}
                onDeleteComment={deleteComment}
                formatCommentDate={formatCommentDate}
                readOnly={readOnly}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent className='max-w-sm border-accent'>
          <DialogHeader>
            <DialogTitle>Archive card?</DialogTitle>
            <DialogDescription>
              The card &quot;{card.title}&quot; will be archived. You can
              restore it later from the board&apos;s archive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowArchiveConfirm(false)}
              variant='secondary'
            >
              Cancel
            </Button>
            <Button
              onClick={archiveCard}
              className='bg-orange-500 hover:bg-orange-600'
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='max-w-sm border-accent'>
          <DialogHeader>
            <DialogTitle className='text-red-600'>Delete card?</DialogTitle>
            <DialogDescription>
              The card &quot;{card.title}&quot; will be permanently deleted.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant='secondary'
            >
              Cancel
            </Button>
            <Button onClick={deleteCard} variant='destructive'>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
