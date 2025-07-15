import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, PlusCircle, Eye, Lock, Calendar, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotesStore from '../store/notesStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getRecentNotes, getNoteStats } = useNotesStore();

  const recentNotes = getRecentNotes(3, user?.id);
  const stats = getNoteStats(user?.id);

  const handleCreateNote = () => {
    navigate('/editor');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to capture your thoughts and ideas?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Notes created
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Notes</CardTitle>
              <Eye className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.public}</div>
              <p className="text-xs text-muted-foreground">
                Shared with community
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Notes</CardTitle>
              <Lock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.private}</div>
              <p className="text-xs text-muted-foreground">
                Personal notes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Recent Notes</span>
                    </CardTitle>
                    <CardDescription>
                      Your recently updated notes
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/my-notes')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No notes yet. Create your first note to get started!
                    </p>
                    <Button onClick={handleCreateNote}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => navigate(`/editor/${note.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg truncate">
                            {note.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {note.isPublic ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {stripHtml(note.content).substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{note.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(note.updatedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleCreateNote}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create New Note
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/my-notes')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Browse My Notes
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/public-notes')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Explore Public Notes
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium text-primary mb-1">Rich Text Editor</p>
                  <p className="text-muted-foreground">
                    Use the toolbar to format your notes with bold, italic, headers, and lists.
                  </p>
                </div>
                <div className="p-3 bg-secondary/5 rounded-lg">
                  <p className="font-medium text-secondary mb-1">Tag Organization</p>
                  <p className="text-muted-foreground">
                    Add tags to your notes to organize and find them quickly.
                  </p>
                </div>
                <div className="p-3 bg-accent/5 rounded-lg">
                  <p className="font-medium text-accent mb-1">Public Sharing</p>
                  <p className="text-muted-foreground">
                    Toggle notes to public to share your knowledge with the community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
