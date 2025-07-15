import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Calendar, User, Tag } from 'lucide-react';

const NotePreview = ({ title, content, tags, isPublic, author, createdAt, updatedAt }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Preview Mode</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {getWordCount()} words
        </div>
      </div>

      {/* Note Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Title */}
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary leading-tight">
              {title || 'Untitled Note'}
            </CardTitle>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {author && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>by {author}</span>
                </div>
              )}
              
              {createdAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className={isPublic ? 'text-green-600' : 'text-orange-600'}>
                  {isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Note Content */}
      <Card>
        <CardContent className="pt-6">
          {content ? (
            <div 
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-blockquote:border-primary/20 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg">Start writing to see your note preview...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      {updatedAt && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {formatDate(updatedAt)}
        </div>
      )}
    </div>
  );
};

export default NotePreview;
