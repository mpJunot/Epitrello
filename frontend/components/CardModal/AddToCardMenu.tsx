import React from "react";
import { Label, UserRef, DueDate } from "./types";

interface AddToCardMenuProps {
  openMenu: string | null;
  toggleMenu: (menu: string) => void;
  menuRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;

  availableMembers: UserRef[];
  assignedMembers: UserRef[];
  isMemberAssigned: (id: string) => boolean;
  toggleMember: (member: UserRef) => void;

  availableLabels: Label[];
  assignedLabels: Label[];
  isLabelAssigned: (id: string) => boolean;
  toggleLabel: (label: Label) => void;

  newChecklistTitle: string;
  setNewChecklistTitle: (v: string) => void;
  createChecklist: () => void;

  selectedDate: string;
  setSelectedDate: (v: string) => void;
  dueDate?: DueDate;
  saveDueDate: () => void;
  removeDueDate: () => void;
}

export default function AddToCardMenu({
  openMenu,
  toggleMenu,
  menuRefs,
  availableMembers,
  assignedMembers,
  isMemberAssigned,
  toggleMember,
  availableLabels,
  assignedLabels,
  isLabelAssigned,
  toggleLabel,
  newChecklistTitle,
  setNewChecklistTitle,
  createChecklist,
  selectedDate,
  setSelectedDate,
  dueDate,
  saveDueDate,
  removeDueDate,
}: AddToCardMenuProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add to card</h3>
      <div className="space-y-2">
        <div className="relative" ref={(el) => { menuRefs.current['members'] = el; }}>
          <button onClick={() => toggleMenu('members')} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Members
          </button>
          {openMenu === 'members' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Members</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                {availableMembers.map((member) => {
                  const initials = member.name ? member.name.split(" ").map((s) => s[0]).slice(0, 2).join("") : (member.email || "U")[0].toUpperCase();
                  const isAssigned = isMemberAssigned(member.id);
                  return (
                    <button key={member.id} onClick={() => toggleMember(member)} className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors ${isAssigned ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${isAssigned ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                        <div className="text-xs text-gray-500 truncate">{member.email}</div>
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

        <div className="relative" ref={(el) => { menuRefs.current['labels'] = el; }}>
          <button onClick={() => toggleMenu('labels')} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Labels
          </button>
          {openMenu === 'labels' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Labels</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {availableLabels.map((label) => {
                  const isAssigned = isLabelAssigned(label.id);
                  return (
                    <button key={label.id} onClick={() => toggleLabel(label)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${label.color} text-white text-sm font-medium hover:opacity-90 transition-all ${isAssigned ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
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
                <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition-colors">Create new label</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={(el) => { menuRefs.current['checklist'] = el; }}>
          <button onClick={() => toggleMenu('checklist')} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
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
                    toggleMenu('checklist');
                    setNewChecklistTitle('');
                  }
                }}
                placeholder="Checklist title..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
              />
              <button onClick={createChecklist} className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                Add
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={(el) => { menuRefs.current['dates'] = el; }}>
          <button onClick={() => toggleMenu('dates')} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Dates
          </button>
          {openMenu === 'dates' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Dates</h4>
              <label className="block text-xs text-gray-600 mb-1">Due date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3" />
              <button onClick={saveDueDate} disabled={!selectedDate} className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                Save
              </button>
              {dueDate && (
                <button onClick={removeDueDate} className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors">
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
