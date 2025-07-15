import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notesAPI } from '../services/api';

const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],
      sortBy: 'updatedAt', // 'createdAt', 'updatedAt', 'title'
      sortOrder: 'desc', // 'asc', 'desc'
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Load notes from API
      loadNotes: async (isPublic = null, authorId = null) => {
        set({ isLoading: true, error: null });
        try {
          const params = {};
          
          if (isPublic !== null) {
            params.isPublic = isPublic;
          }
          
          if (authorId) {
            params.author = authorId;
          }
          
          const { searchQuery, selectedTags, sortBy, sortOrder } = get();
          
          if (searchQuery) {
            params.search = searchQuery;
          }
          
          if (selectedTags.length > 0) {
            params.tags = selectedTags.join(',');
          }
          
          params.sortBy = sortBy;
          params.sortOrder = sortOrder;
          params.limit = 100; // Get more notes for client-side filtering
          
          const response = await notesAPI.getAllNotes(params);
          
          set({ 
            notes: response.notes || [], 
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.message || 'Failed to load notes';
          set({ 
            isLoading: false, 
            error: errorMessage,
            notes: []
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Get filtered notes (client-side filtering for better UX)
      getFilteredNotes: (isPublic = null, authorId = null) => {
        const { notes, searchQuery, selectedTags, sortBy, sortOrder } = get();
        
        let filteredNotes = [...notes];
        
        // Filter by public/private
        if (isPublic !== null) {
          filteredNotes = filteredNotes.filter(note => note.isPublic === isPublic);
        }
        
        // Filter by author
        if (authorId) {
          filteredNotes = filteredNotes.filter(note => 
            note.author && (
              note.author._id === authorId || 
              note.author.id === authorId ||
              note.author === authorId ||
              note.authorId === authorId
            )
          );
        }
        
        // Search filter (client-side for immediate response)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            (note.author.name && note.author.name.toLowerCase().includes(query))
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
        const { notes } = get();
        // console.log(notes);
        // console.log(id);
        return notes.find(note => note._id === id);
      },
      
      // Load single note by ID
      loadNoteById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await notesAPI.getNoteById(id);
          
          // Update note in the store if it exists, otherwise add it
          const { notes } = get();
          const existingIndex = notes.findIndex(note => 
            note._id === response.note._id || note.id === response.note._id
          );
          
          let updatedNotes;
          if (existingIndex >= 0) {
            updatedNotes = [...notes];
            updatedNotes[existingIndex] = response.note;
          } else {
            updatedNotes = [...notes, response.note];
          }
          
          set({ 
            notes: updatedNotes, 
            isLoading: false,
            error: null
          });
          
          return { success: true, note: response.note };
        } catch (error) {
          const errorMessage = error.message || 'Failed to load note';
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Create new note
      createNote: async (noteData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await notesAPI.createNote(noteData);
          
          if (response.note) {
            const { notes } = get();
            set({ 
              notes: [response.note, ...notes], 
              isLoading: false,
              error: null
            });
            
            return { success: true, note: response.note };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Failed to create note' 
            });
            return { success: false, error: response.message };
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to create note';
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Update note
      updateNote: async (id, noteData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await notesAPI.updateNote(id, noteData);
          
          const { notes } = get();
          const updatedNotes = notes.map(note => 
            (note._id === id || note.id === id) ? response.note : note
          );
          
          set({ 
            notes: updatedNotes, 
            isLoading: false,
            error: null
          });
          
          return { success: true, note: response.note };
        } catch (error) {
          const errorMessage = error.message || 'Failed to update note';
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Delete note
      deleteNote: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await notesAPI.deleteNote(id);
          
          const { notes } = get();
          const updatedNotes = notes.filter(note => 
            note._id !== id && note.id !== id
          );
          
          set({ 
            notes: updatedNotes, 
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.message || 'Failed to delete note';
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Get all unique tags
      getAllTags: () => {
        const { notes } = get();
        const tagCounts = {};
        
        notes.forEach(note => {
          note.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        
        return Object.keys(tagCounts)
          .sort((a, b) => tagCounts[b] - tagCounts[a])
          .slice(0, 20); // Return top 20 tags
      },
      
      // Search and filter setters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      
      // Add/remove tag filters
      addTagFilter: (tag) => {
        const { selectedTags } = get();
        if (!selectedTags.includes(tag)) {
          set({ selectedTags: [...selectedTags, tag] });
        }
      },
      
      removeTagFilter: (tag) => {
        const { selectedTags } = get();
        set({ selectedTags: selectedTags.filter(t => t !== tag) });
      },
      
      clearFilters: () => {
        set({ 
          searchQuery: '', 
          selectedTags: [] 
        });
      },
      
      // Get user's notes
      getUserNotes: (userId) => {
        const { notes } = get();
        return notes.filter(note => 
          note.author && (note.author._id === userId || note.author.id === userId)
        );
      },
      
      // Get recent notes
      getRecentNotes: (limit = 5, userId = null) => {
        const { notes } = get();
        let filteredNotes = notes;
        
        if (userId) {
          filteredNotes = notes.filter(note => 
            note.author && (
              note.author._id === userId || 
              note.author.id === userId ||
              note.author === userId ||
              note.authorId === userId
            )
          );
        }
        
        return filteredNotes
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);
      },
      
      // Get note statistics
      getNoteStats: (userId = null) => {
        const { notes } = get();
        let filteredNotes = notes;
        
        if (userId) {
          filteredNotes = notes.filter(note => 
            note.author && (
              note.author._id === userId || 
              note.author.id === userId ||
              note.author === userId ||
              note.authorId === userId
            )
          );
        }
        
        const publicNotes = filteredNotes.filter(note => note.isPublic).length;
        const privateNotes = filteredNotes.filter(note => !note.isPublic).length;
        const totalViews = filteredNotes.reduce((sum, note) => sum + (note.views || 0), 0);
        const totalLikes = filteredNotes.reduce((sum, note) => sum + (note.likes?.length || 0), 0);
        
        return {
          total: filteredNotes.length,
          public: publicNotes,
          private: privateNotes,
          views: totalViews,
          likes: totalLikes
        };
      }
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
        selectedTags: state.selectedTags,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      }),
    }
  )
);

// export { useNotesStore };
export default useNotesStore;
