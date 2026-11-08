import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, ShieldCheck, HardDrive, Check, AlertCircle } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { ShelfBook } from '../types/index.ts';

interface StorageBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageBackupModal: React.FC<StorageBackupModalProps> = ({ isOpen, onClose }) => {
  const { books, importBooks } = useShelfStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check Chrome / browser persistent storage status
  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then((persisted) => {
        setIsPersisted(persisted);
      }).catch(() => {
        setIsPersisted(false);
      });
    }
  }, [isOpen]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (!isOpen) return null;

  // Request Chrome to grant persistent storage
  const handleRequestPersistence = async () => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const granted = await navigator.storage.persist();
        setIsPersisted(granted);
        if (granted) {
          setFeedback({
            type: 'success',
            message: 'Chrome persistent storage activated! Your shelf is protected from cache cleanups.',
          });
        } else {
          setFeedback({
            type: 'error',
            message: 'Browser did not grant permanent persistence, but localStorage is active.',
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Could not request persistent storage in this browser context.',
        });
      }
    }
  };

  // Export shelf as a JSON backup file
  const handleExportBackup = () => {
    try {
      const exportData = {
        app: 'ShelfVan',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalBooks: books.length,
        books,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `shelfvan-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setFeedback({
        type: 'success',
        message: `Successfully downloaded backup with ${books.length} ${books.length === 1 ? 'book' : 'books'}!`,
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to create export file.',
      });
    }
  };

  // Trigger file selection for restore
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  // Handle uploaded backup file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let incomingBooks: ShelfBook[] = [];
        if (Array.isArray(parsed)) {
          incomingBooks = parsed;
        } else if (Array.isArray(parsed.books)) {
          incomingBooks = parsed.books;
        } else {
          throw new Error('Unrecognized backup format');
        }

        if (incomingBooks.length === 0) {
          setFeedback({ type: 'error', message: 'No valid books found in this file.' });
          return;
        }

        const added = importBooks(incomingBooks);
        setFeedback({
          type: 'success',
          message: `Restored ${incomingBooks.length} books (${added} new) to your library!`,
        });
      } catch {
        setFeedback({
          type: 'error',
          message: 'Invalid backup file. Please select a valid shelfvan-backup.json file.',
        });
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e4e4e7',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#f4f4f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#18181b',
              }}
            >
              <HardDrive size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#18181b' }}>
                Browser Storage & Backup
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                Account-free local preservation for Chrome
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: feedback.type === 'success' ? '#166534' : '#991b1b',
              borderBottom: feedback.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              fontSize: '0.84rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Explanation */}
          <p style={{ fontSize: '0.88rem', color: '#52525b', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Because ShelfVan runs locally in your browser without requiring a remote user account, all your saved books and reading lists are kept directly inside your browser's persistent cache.
          </p>

          {/* Chrome Persistent Storage Status Card */}
          <div
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e4e4e7',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color={isPersisted ? '#16a34a' : '#ea580c'} />
                <strong style={{ fontSize: '0.9rem', color: '#18181b' }}>
                  Chrome Storage Protection
                </strong>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: isPersisted ? '#dcfce7' : '#ffedd5',
                  color: isPersisted ? '#15803d' : '#c2410c',
                }}
              >
                {isPersisted ? 'Permanent' : 'Standard'}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '0 0 12px 0', lineHeight: '1.4' }}>
              {isPersisted
                ? 'Your browser has marked ShelfVan storage as persistent. Chrome will never automatically evict your reading shelf, even when disk space is low.'
                : 'Request permanent storage so Chrome never automatically clears your library during browser cache cleanup.'}
            </p>

            {!isPersisted && (
              <button
                onClick={handleRequestPersistence}
                style={{
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} />
                <span>Protect Storage from Cleanup</span>
              </button>
            )}
          </div>

          {/* Backup / Export and Restore Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#a1a1aa';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e4e4e7';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f4f4f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  color: '#18181b',
                }}
              >
                <Download size={16} />
              </div>
              <strong style={{ fontSize: '0.86rem', color: '#18181b', marginBottom: '2px' }}>
                Export Backup
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#71717a' }}>
                Download .json file of your {books.length} saved books
              </span>
            </button>

            {/* Restore from File */}
            <button
              onClick={handleTriggerImport}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#a1a1aa';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e4e4e7';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f4f4f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  color: '#18181b',
                }}
              >
                <Upload size={16} />
              </div>
              <strong style={{ fontSize: '0.86rem', color: '#18181b', marginBottom: '2px' }}>
                Restore Library
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#71717a' }}>
                Import a saved backup file from your device
              </span>
            </button>
          </div>

          {/* Hidden File Input for Restore */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Statistics Bar */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f4f4f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
              color: '#71717a',
            }}
          >
            <span>Current Library: {books.length} {books.length === 1 ? 'book' : 'books'} saved</span>
            <span>Storage: localStorage (Protected)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

