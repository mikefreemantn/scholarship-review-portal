import React, { useState } from 'react';
import { MessageSquare, Trash2, User } from 'lucide-react';
import { Note } from '../types';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onDeleteNote?: (noteId: string) => void;
  currentUserEmail: string;
  isAdmin: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  currentUserEmail,
  isAdmin,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      await onAddNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={20} />
          Notes ({notes.length})
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Note
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your note here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Note
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No notes yet. Be the first to add one!</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.noteId}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-sm">{note.boardMemberName}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                {(isAdmin || note.boardMemberEmail === currentUserEmail) && onDeleteNote && (
                  <button
                    onClick={() => onDeleteNote(note.noteId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
