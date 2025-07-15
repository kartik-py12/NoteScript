import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Lock, 
  Calendar, 
  Edit3, 
  Trash2,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotesStore from '../store/notesStore';

const MyNotesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    getFilteredNotes,
    searchQuery,
    setSearchQuery,
    loadNotes,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    getAllTags,
    deleteNote,
    
  } = useNotesStore();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  const notes = getFilteredNotes(null,user?.id);
  const allTags = getAllTags();

// Load notes when component mounts
//   useEffect(() => {
//     if (user) {
//       loadNotes();
//     }
//   }, [user, loadNotes]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleTagToggle = (tag) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const renderNoteCard = (note) => (
    <Card
      key={note._id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/editor/${note._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {note.isPublic ? (
              <Eye className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-red-500 hover:text-red-700"
              onClick={(e) => handleDeleteNote(note._id, e)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {stripHtml(note.content).substring(0, 100)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Updated {formatDate(note.updatedAt)}
            </div>
            <div className="flex items-center space-x-1">
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNoteList = (note) => (
    <div
      key={note._id}
      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={() => navigate(`/editor/${note._id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{note.title}</h3>
        <div className="flex items-center space-x-2">
          {note.isPublic ? (
            <Eye className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-500" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-red-500 hover:text-red-700"
            onClick={(e) => handleDeleteNote(note._id, e)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
        {stripHtml(note.content).substring(0, 200)}...
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(note.updatedAt)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Notes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {notes.length} note{notes.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button onClick={() => navigate('/editor')} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search notes by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                  <Button
                    variant={sortBy === 'updatedAt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('updatedAt')}
                    className="flex items-center space-x-1"
                  >
                    <span>Updated</span>
                    {sortBy === 'updatedAt' && (
                      sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === 'createdAt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('createdAt')}
                    className="flex items-center space-x-1"
                  >
                    <span>Created</span>
                    {sortBy === 'createdAt' && (
                      sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === 'title' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('title')}
                    className="flex items-center space-x-1"
                  >
                    <span>Title</span>
                    {sortBy === 'title' && (
                      sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                    )}
                  </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tag Filters */}
              {showFilters && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Filter by tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Display */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No notes found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || selectedTags.length > 0 
                  ? "Try adjusting your search or filters"
                  : "Create your first note to get started"
                }
              </p>
              <Button onClick={() => navigate('/editor')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => renderNoteCard(note))}
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => renderNoteList(note))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotesPage;
