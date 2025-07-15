import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyNotesPage from './pages/MyNotesPage';
import PublicNotesPage from './pages/PublicNotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import NoteViewPage from './pages/NoteViewPage';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import './index.css';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();

  // Initialize theme on app start
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        {isAuthenticated && <Navbar />}
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
            } 
          />

          {/* Public note viewing (accessible to everyone) */}
          <Route path="/note/:id" element={<NoteViewPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-notes" 
            element={
              <ProtectedRoute>
                <MyNotesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/public-notes" 
            element={
              <ProtectedRoute>
                <PublicNotesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <NoteEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor/:id" 
            element={
              <ProtectedRoute>
                <NoteEditorPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirect to home or login */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
