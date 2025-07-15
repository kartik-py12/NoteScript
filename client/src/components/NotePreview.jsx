import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Calendar, User, Tag } from 'lucide-react';
import { lowlight } from 'lowlight';
import './NotePreview.css';
import './SyntaxHighlight.css';

const NotePreview = ({ title, content, tags, isPublic, author, createdAt, updatedAt }) => {
  const contentRef = useRef(null);

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

  // Apply syntax highlighting to code blocks in preview
  useEffect(() => {
    if (contentRef.current && content) {
      console.log('Applying syntax highlighting to preview...');
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      console.log(`Found ${codeBlocks.length} code blocks`);
      
      codeBlocks.forEach((block, index) => {
        // Skip if already highlighted
        if (block.classList.contains('hljs-processed')) {
          return;
        }
        
        // Get language from class attribute
        const classList = Array.from(block.classList);
        const languageClass = classList.find(cls => cls.startsWith('language-'));
        const language = languageClass ? languageClass.replace('language-', '') : '';
        
        console.log(`Block ${index}: language="${language}", text="${block.textContent?.substring(0, 50)}..."`);
        
        if (language && lowlight.registered(language)) {
          try {
            const result = lowlight.highlight(language, block.textContent || '');
            console.log('Lowlight result:', result);
            
            // Use a simpler approach - create a temporary element and let lowlight structure the content
            if (result && result.children && result.children.length > 0) {
              // Convert hast tree to HTML
              const toHtml = (node) => {
                if (node.type === 'text') {
                  return node.value || '';
                }
                if (node.type === 'element') {
                  const className = node.properties?.className ? ` class="${node.properties.className.join(' ')}"` : '';
                  const children = node.children ? node.children.map(toHtml).join('') : '';
                  return `<${node.tagName}${className}>${children}</${node.tagName}>`;
                }
                return '';
              };
              
              const htmlString = result.children.map(toHtml).join('');
              block.innerHTML = htmlString;
              block.classList.add('hljs', 'hljs-processed');
              console.log(`Successfully highlighted block ${index} with language ${language}`);
            } else {
              // Fallback - just add hljs class for styling
              block.classList.add('hljs', 'hljs-processed');
              console.log(`No highlighting result for block ${index}, applied default styling`);
            }
          } catch (error) {
            console.warn('Failed to highlight code block:', error);
            block.classList.add('hljs', 'hljs-processed');
          }
        } else {
          // Apply default styling for code blocks without language
          block.classList.add('hljs', 'hljs-processed');
          console.log(`Applied default hljs styling to block ${index} (language: ${language || 'none'})`);
        }
      });
    }
  }, [content]);

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
            <div className="note-preview-content">
              <div 
                ref={contentRef}
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
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
