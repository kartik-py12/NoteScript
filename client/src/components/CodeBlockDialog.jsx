import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Code, Check, X, ChevronDown } from 'lucide-react';

const CodeBlockDialog = ({ isOpen, onClose, onConfirm, defaultLanguage = '', defaultCode = '' }) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(defaultCode);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Popular programming languages
  const languages = [
    { value: '', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'dockerfile', label: 'Dockerfile' },
  ];

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setLanguage(defaultLanguage);
      setCode(defaultCode);
      setShowLanguageDropdown(false);
    }
  }, [isOpen, defaultLanguage, defaultCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ language: language.trim(), code: code.trim() });
    onClose();
  };

  const handleCancel = () => {
    setLanguage(defaultLanguage);
    setCode(defaultCode);
    setShowLanguageDropdown(false);
    onClose();
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Add Code Block</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="code-language">Programming Language</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <span>
                    {languages.find(lang => lang.value === language)?.label || 'Select Language...'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 w-full bg-background border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                        onClick={() => handleLanguageSelect(lang.value)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Code Input */}
            <div className="space-y-2">
              <Label htmlFor="code-content">Code</Label>
              <textarea
                id="code-content"
                className="w-full min-h-[300px] p-3 border border-border rounded-md bg-muted font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Tip: You can paste code directly and it will be formatted automatically
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Code Block
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeBlockDialog;
