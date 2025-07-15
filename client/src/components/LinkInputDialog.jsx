import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Link, X, Check } from 'lucide-react';

const LinkInputDialog = ({ isOpen, onClose, onConfirm, defaultUrl = '', defaultText = '' }) => {
  const [url, setUrl] = useState(defaultUrl);
  const [text, setText] = useState(defaultText);
  const [error, setError] = useState('');

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setUrl(defaultUrl);
      setText(defaultText);
      setError('');
    }
  }, [isOpen, defaultUrl, defaultText]);

  const validateUrl = (urlString) => {
    try {
      // Add protocol if missing
      if (urlString && !urlString.match(/^https?:\/\//)) {
        urlString = 'https://' + urlString;
      }
      new URL(urlString);
      return urlString;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const validatedUrl = validateUrl(url.trim());
    if (!validatedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    onConfirm({ url: validatedUrl, text: text.trim() });
    onClose();
  };

  const handleCancel = () => {
    setUrl(defaultUrl);
    setText(defaultText);
    setError('');
    onClose();
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Add Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="text"
                placeholder="https://example.com or example.com"
                value={url}
                onChange={handleUrlChange}
                autoFocus
                required
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Link description"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the selected text or URL
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
                Add Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkInputDialog;
