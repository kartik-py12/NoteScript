import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { lowlight } from 'lowlight';
import { Button } from './ui/button';
import LinkInputDialog from './LinkInputDialog';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Code2,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';

// Import only JavaScript for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';

// Register only JavaScript with lowlight
lowlight.registerLanguage('javascript', javascript);

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your note..." }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '' });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use our custom one
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-secondary hover:text-secondary/80 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      const safeContent = content || '';
      // Use a timeout to ensure the editor is fully initialized
      setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(safeContent, false);
        }
      }, 0);
    }
  }, [editor, content]);

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    
    setLinkData({
      url: previousUrl || '',
      text: selectedText || ''
    });
    setShowLinkDialog(true);
  };

  const handleLinkConfirm = ({ url, text }) => {
    setShowLinkDialog(false);
    
    if (!url || url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // If text is provided and no text is selected, insert the text with the link
    if (text && editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`).run();
    } else {
      // Apply link to selected text or insert URL if no text selected
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleCodeBlock = () => {
    // Simply insert a JavaScript code block
    editor.chain()
      .focus()
      .setCodeBlock({ language: 'javascript' })
      .run();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <>
      <div className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20 bg-background">
        {/* Toolbar */}
        <div className="border-b p-3 flex flex-wrap gap-1 bg-muted/30">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={handleCodeBlock}
            isActive={editor.isActive('codeBlock')}
            title="JavaScript Code Block (More languages coming in new update!)"
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? "default" : "ghost"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className="h-8 px-2 text-xs font-semibold"
          >
            H1
          </Button>
          
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? "default" : "ghost"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className="h-8 px-2 text-xs font-semibold"
          >
            H2
          </Button>
          
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? "default" : "ghost"}
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className="h-8 px-2 text-xs font-semibold"
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Quote and Horizontal Rule */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Line"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
            isActive={false}
          >
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            isActive={false}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            isActive={false}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative bg-background">
        <div className="max-h-[70vh] overflow-y-auto">
            
          <EditorContent 
            editor={editor} 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-blockquote:border-primary/20 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted focus:outline-none p-6 bg-background min-h-[400px]"
          />
        </div>
      </div>
      </div>

      {/* Link Input Dialog */}
      <LinkInputDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onConfirm={handleLinkConfirm}
        defaultUrl={linkData.url}
        defaultText={linkData.text}
      />
    </>
  );
};

export default RichTextEditor;
