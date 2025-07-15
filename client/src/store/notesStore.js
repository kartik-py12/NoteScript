import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock data for development
const mockNotes = [
  {
    id: '1',
    title: 'Welcome to Twilight Note Flow',
    content: '<p>This is your first note! You can edit this content and make it your own.</p><p><strong>Features:</strong></p><ul><li>Rich text editing</li><li>Public and private notes</li><li>Tag organization</li><li>Search functionality</li></ul>',
    tags: ['welcome', 'tutorial'],
    isPublic: true,
    author: 'System',
    authorId: 'system',
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: '2',
    title: 'My Private Thoughts',
    content: '<p>This is a private note that only you can see.</p><p>Use this space for personal thoughts, ideas, and reminders.</p>',
    tags: ['personal', 'private'],
    isPublic: false,
    author: 'You',
    authorId: '1',
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: '3',
    title: 'JavaScript Best Practices',
    content: '<h2>Modern JavaScript Tips</h2><p>Here are some best practices for writing clean JavaScript:</p><ol><li>Use const and let instead of var</li><li>Prefer arrow functions for callbacks</li><li>Use template literals for string interpolation</li><li>Destructure objects and arrays</li></ol>',
    tags: ['javascript', 'programming', 'tips'],
    isPublic: true,
    author: 'DevUser',
    authorId: '2',
    createdAt: new Date('2025-01-12').toISOString(),
    updatedAt: new Date('2025-01-12').toISOString(),
  }
];

const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: mockNotes,
      isLoading: false,
      searchQuery: '',
      selectedTags: [],
      sortBy: 'updatedAt', // 'createdAt', 'updatedAt', 'title'
      sortOrder: 'desc', // 'asc', 'desc'
      
      // Get all notes
      getAllNotes: () => {
        return get().notes;
      },
      
      // Get user's notes
      getUserNotes: (userId) => {
        return get().notes.filter(note => note.authorId === userId);
      },
      
      // Get public notes
      getPublicNotes: () => {
        return get().notes.filter(note => note.isPublic);
      },
      
      // Get filtered notes
      getFilteredNotes: (isPublic = false, userId = null) => {
        const { notes, searchQuery, selectedTags, sortBy, sortOrder } = get();
        
        let filteredNotes = notes;
        
        // Filter by visibility and author
        if (isPublic) {
          filteredNotes = filteredNotes.filter(note => note.isPublic);
        } else if (userId) {
          filteredNotes = filteredNotes.filter(note => note.authorId === userId);
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.author.toLowerCase().includes(query)
          );
        }
        
        // Filter by tags
        if (selectedTags.length > 0) {
          filteredNotes = filteredNotes.filter(note =>
            selectedTags.some(tag => note.tags.includes(tag))
          );
        }
        
        // Sort notes
        filteredNotes.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          if (sortBy === 'title') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        return filteredNotes;
      },
      
      // Get note by ID
      getNoteById: (id) => {
        return get().notes.find(note => note.id === id);
      },
      
      // Create new note
      createNote: (noteData) => {
        const newNote = {
          id: Date.now().toString(),
          title: noteData.title || 'Untitled Note',
          content: noteData.content || '',
          tags: noteData.tags || [],
          isPublic: noteData.isPublic || false,
          author: noteData.author,
          authorId: noteData.authorId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          notes: [newNote, ...state.notes]
        }));
        
        return newNote;
      },
      
      // Update note
      updateNote: (id, updates) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          )
        }));
      },
      
      // Delete note
      deleteNote: (id) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id)
        }));
      },
      
      // Search actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      
      // Tag actions
      setSelectedTags: (tags) => {
        set({ selectedTags: tags });
      },
      
      // Get all unique tags
      getAllTags: () => {
        const { notes } = get();
        const tagSet = new Set();
        notes.forEach(note => {
          note.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
      },
      
      // Sort actions
      setSortBy: (sortBy) => {
        set({ sortBy });
      },
      
      setSortOrder: (sortOrder) => {
        set({ sortOrder });
      },
      
      // Get recent notes
      getRecentNotes: (limit = 5, userId = null) => {
        const { notes } = get();
        let filteredNotes = notes;
        
        if (userId) {
          filteredNotes = notes.filter(note => note.authorId === userId);
        }
        
        return filteredNotes
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);
      },
      
      // Get note stats
      getNoteStats: (userId = null) => {
        const { notes } = get();
        let userNotes = notes;
        
        if (userId) {
          userNotes = notes.filter(note => note.authorId === userId);
        }
        
        const publicNotes = userNotes.filter(note => note.isPublic);
        const privateNotes = userNotes.filter(note => !note.isPublic);
        
        return {
          total: userNotes.length,
          public: publicNotes.length,
          private: privateNotes.length,
        };
      }
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);

export default useNotesStore;
