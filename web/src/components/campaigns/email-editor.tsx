'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EmailEditorProps {
  initialContent?: string;
  templateContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmailEditor({ 
  initialContent = '', 
  templateContent = '', 
  onSave, 
  onCancel, 
  isLoading = false 
}: EmailEditorProps) {
  const [content, setContent] = useState(initialContent || templateContent);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    setContent(initialContent || templateContent);
  }, [initialContent, templateContent]);

  const generatePreview = async () => {
    if (!content.trim()) {
      setPreviewHtml('<p>No content to preview</p>');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Simple MJML to HTML conversion for preview
      // In a real implementation, you might want to call a backend service
      // or use a proper MJML library
      const htmlContent = content
        .replace(/<mjml>/g, '')
        .replace(/<\/mjml>/g, '')
        .replace(/<mj-body>/g, '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">')
        .replace(/<\/mj-body>/g, '</div>')
        .replace(/<mj-section>/g, '<div style="padding: 20px 0;">')
        .replace(/<\/mj-section>/g, '</div>')
        .replace(/<mj-column>/g, '<div style="padding: 0 10px;">')
        .replace(/<\/mj-column>/g, '</div>')
        .replace(/<mj-text([^>]*)>/g, '<div style="line-height: 1.6; color: #333;">')
        .replace(/<\/mj-text>/g, '</div>')
        .replace(/<mj-button([^>]*)>/g, '<a style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0;">')
        .replace(/<\/mj-button>/g, '</a>')
        .replace(/<mj-divider([^>]*)>/g, '<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">')
        .replace(/<mj-spacer([^>]*)>/g, '<div style="height: 20px;"></div>');
      
      setPreviewHtml(htmlContent);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
      setPreviewHtml('<p>Error generating preview</p>');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (content) {
        generatePreview();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [content]);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Email content cannot be empty');
      return;
    }
    onSave(content);
  };

  const resetToTemplate = () => {
    if (templateContent) {
      setContent(templateContent);
      toast.success('Content reset to template');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Email Content Editor</CardTitle>
          <div className="flex gap-2">
            {templateContent && content !== templateContent && (
              <Button variant="outline" size="sm" onClick={resetToTemplate}>
                Reset to Template
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="split" className="w-full h-full">
          <div className="px-4 pb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                MJML Editor
              </TabsTrigger>
              <TabsTrigger value="split" className="flex items-center gap-2">
                Split View
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="mt-0 px-4 pb-6">
            <div className="space-y-4">
              <div className="text-sm font-medium">MJML Content</div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your MJML content here..."
                className="min-h-[900px] font-mono text-sm resize-none w-full"
              />
              <div className="text-xs text-muted-foreground">
                Tip: Use MJML syntax like &lt;mj-text&gt;, &lt;mj-button&gt;, &lt;mj-section&gt; for responsive email design
              </div>
            </div>
          </TabsContent>

          <TabsContent value="split" className="mt-0 px-4 pb-6">
            <div className="grid grid-cols-2 gap-4 h-[900px]">
              <div className="space-y-4">
                <div className="text-sm font-medium">MJML Content</div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your MJML content here..."
                  className="h-full font-mono text-sm resize-none w-full"
                />
              </div>
              <div className="space-y-4">
                <div className="text-sm font-medium flex items-center gap-2">
                  Email Preview
                  {isGeneratingPreview && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div 
                  className="border rounded-lg p-4 bg-white h-full overflow-auto"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Tip: Use MJML syntax like &lt;mj-text&gt;, &lt;mj-button&gt;, &lt;mj-section&gt; for responsive email design
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0 px-4 pb-6">
            <div className="space-y-4">
              <div className="text-sm font-medium flex items-center gap-2">
                Email Preview
                {isGeneratingPreview && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div 
                className="border rounded-lg p-4 bg-white min-h-[900px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}