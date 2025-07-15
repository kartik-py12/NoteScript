import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your note..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-secondary hover:text-secondary/80 underline',
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

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-3 flex flex-wrap gap-1">
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
        </div>

        {/* Headings */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-8 px-2 text-xs font-semibold"
          >
            H1
          </Button>
          
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 px-2 text-xs font-semibold"
          >
            H2
          </Button>
          
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary focus:outline-none p-4 min-h-[400px]"
      />
    </div>
  );
};

export default RichTextEditor;
