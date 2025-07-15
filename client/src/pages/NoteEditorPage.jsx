import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import RichTextEditor from '../components/RichTextEditor';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Tag, 
  X,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import useNotesStore from '../store/notesStore';
import useAuthStore from '../store/authStore';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getNoteById, createNote, updateNote, getAllTags } = useNotesStore();
  
  const isEditing = !!id;
  const existingNote = isEditing ? getNoteById(id) : null;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const allTags = getAllTags();

  // Initialize form with existing note data
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setTags(existingNote.tags);
      setIsPublic(existingNote.isPublic);
    }
  }, [existingNote]);

  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return;
    
    const timer = setTimeout(() => {
      handleSave(true); // silent save
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, tags, isPublic]);

  const handleSave = async (silent = false) => {
    if (!title.trim()) {
      if (!silent) {
        alert('Please enter a title for your note');
      }
      return;
    }

    setIsSaving(true);
    
    try {
      const noteData = {
        title: title.trim(),
        content,
        tags,
        isPublic,
        author: user.name,
        authorId: user.id
      };

      if (isEditing) {
        updateNote(id, noteData);
      } else {
        const newNote = createNote(noteData);
        navigate(`/editor/${newNote.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      
      if (!silent) {
        // Show success feedback
        setTimeout(() => {
          setIsSaving(false);
        }, 500);
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving note:', error);
      if (!silent) {
        alert('Error saving note. Please try again.');
      }
    }
  };

  const handleAddTag = (tagToAdd = newTag) => {
    const trimmedTag = tagToAdd.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            {/* Auto-save indicator */}
            {lastSaved && (
              <span className="text-sm text-gray-500 flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Saved at {formatLastSaved()}</span>
              </span>
            )}
            
            {/* Save button */}
            <Button 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Note Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter your note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your note..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Note Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Note Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Toggle */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Button
                    variant={isPublic ? "default" : "outline"}
                    onClick={() => setIsPublic(!isPublic)}
                    className="w-full justify-start"
                  >
                    {isPublic ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Public - Visible to everyone
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Private - Only visible to you
                      </>
                    )}
                  </Button>
                </div>

                {/* Word Count */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Word count: {getWordCount()}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add New Tag */}
                <div className="space-y-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                  />
                  <Button
                    onClick={() => handleAddTag()}
                    disabled={!newTag.trim()}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Add Tag
                  </Button>
                </div>

                {/* Popular Tags */}
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                      Popular tags:
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {allTags.slice(0, 8).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer text-xs"
                          onClick={() => handleAddTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Note Info */}
            {existingNote && (
              <Card>
                <CardHeader>
                  <CardTitle>Note Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span>
                    <br />
                    {new Date(existingNote.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span>
                    <br />
                    {new Date(existingNote.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorPage;
