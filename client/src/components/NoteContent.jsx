import React, { useEffect, useRef } from 'react';
import { lowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';

// Register JavaScript language
lowlight.registerLanguage('javascript', javascript);

const NoteContent = ({ content, className = "" }) => {
  const contentRef = useRef(null);

  // Apply syntax highlighting to code blocks and handle links
  useEffect(() => {
    if (contentRef.current && content) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      
      codeBlocks.forEach((block) => {
        // Skip if already processed
        if (block.classList.contains('hljs-processed')) {
          return;
        }
        
        try {
          // Apply JavaScript highlighting to all code blocks
          const result = lowlight.highlight('javascript', block.textContent || '');
          
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
          
          if (result && result.children && result.children.length > 0) {
            const htmlString = result.children.map(toHtml).join('');
            block.innerHTML = htmlString;
          }
          
          // Add classes for styling
          block.classList.add('hljs', 'hljs-processed');
          block.parentElement.classList.add('language-javascript');
          
        } catch (error) {
          console.warn('Failed to highlight code block:', error);
          block.classList.add('hljs', 'hljs-processed');
        }
      });

      // Handle link clicks
      const links = contentRef.current.querySelectorAll('a[href]');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          // Allow external links to open normally
          const href = link.getAttribute('href');
          if (href && (href.startsWith('http') || href.startsWith('https'))) {
            e.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        });
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={`prose prose-lg max-w-none dark:prose-invert 
        prose-headings:text-primary prose-headings:font-bold prose-headings:leading-tight
        prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
        prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-6
        prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-5
        prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
        prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-3
        prose-h6:text-base prose-h6:mb-2 prose-h6:mt-3
        prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
        prose-a:text-secondary prose-a:underline hover:prose-a:text-secondary/80 prose-a:transition-colors
        prose-strong:text-primary prose-strong:font-semibold
        prose-em:text-foreground prose-em:italic
        prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
        prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-1
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-1
        prose-li:text-foreground prose-li:leading-7
        prose-hr:border-border prose-hr:my-6 prose-hr:border-t-2
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default NoteContent;
