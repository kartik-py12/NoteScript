import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Calendar, User, Eye, Edit3 } from 'lucide-react';
import useNotesStore from '../store/notesStore';
import useAuthStore from '../store/authStore';

const NoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNoteById } = useNotesStore();
  const { user } = useAuthStore();
  
  const note = getNoteById(id);

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Note not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The note you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/public-notes')}>
              Back to Public Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = user && user.id === note.authorId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          {isOwner && (
            <Button 
              onClick={() => navigate(`/editor/${note.id}`)}
              className="flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Note</span>
            </Button>
          )}
        </div>

        {/* Note Content */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-4">
                  {note.title}
                </CardTitle>
                
                {/* Note Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>By {note.author}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {formatDate(note.updatedAt)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span>Public</span>
                  </div>
                </div>
                
                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Note Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
            
            {/* Footer */}
            <div className="border-t pt-6 mt-8">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  Created on {formatDate(note.createdAt)}
                </div>
                {note.createdAt !== note.updatedAt && (
                  <div>
                    Last updated on {formatDate(note.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Actions */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/public-notes')}
            >
              Browse More Notes
            </Button>
            
            {!isOwner && (
              <Button 
                onClick={() => navigate('/editor')}
                className="bg-primary hover:bg-primary/90"
              >
                Create Your Own Note
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage;
