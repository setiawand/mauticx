'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { EmailEditor } from './email-editor';
import { Edit, ArrowLeft, ArrowRight } from 'lucide-react';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  template_id: z.number().min(1, 'Please select a template'),
  segment_id: z.number().min(1, 'Please select a segment'),
  send_at: z.string().optional(),
  custom_content: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface Template {
  id: number;
  name: string;
  mjml: string;
}

interface Segment {
  id: number;
  name: string;
}

type Step = 'details' | 'content' | 'review';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [customContent, setCustomContent] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      template_id: 0,
      segment_id: 0,
      send_at: '',
      custom_content: '',
    },
  });

  // Watch template_id to update selected template
  const watchedTemplateId = form.watch('template_id');
  React.useEffect(() => {
    if (watchedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === watchedTemplateId);
      setSelectedTemplate(template || null);
      if (template && !customContent) {
        setCustomContent(template.mjml);
      }
    }
  }, [watchedTemplateId, templates, customContent]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await apiClient.get('/templates') as { data: Template[] };
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchSegments = async () => {
    setSegmentsLoading(true);
    try {
      const response = await apiClient.get('/segments') as { data: Segment[] };
      setSegments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setSegmentsLoading(false);
    }
  };

  const handleOpen = () => {
    if (isOpen) {
      fetchTemplates();
      fetchSegments();
    }
  };

  React.useEffect(() => {
    handleOpen();
  }, [isOpen]);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        template_id: data.template_id,
        segment_id: data.segment_id,
        send_at: data.send_at || null,
        custom_content: customContent || null,
      };

      await apiClient.post('/campaigns', payload);
      toast.success('Campaign created successfully!');
      handleReset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setCurrentStep('details');
    setCustomContent('');
    setSelectedTemplate(null);
  };

  const handleNextStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('content');
    } else if (currentStep === 'content') {
      setCurrentStep('review');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'content') {
      setCurrentStep('details');
    } else if (currentStep === 'review') {
      setCurrentStep('content');
    }
  };

  const handleSaveContent = (content: string) => {
    setCustomContent(content);
    toast.success('Email content saved!');
    setCurrentStep('review');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details': return 'Campaign Details';
      case 'content': return 'Email Content';
      case 'review': return 'Review & Create';
      default: return 'Create Campaign';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'details': return 'Enter campaign details and select template and segment.';
      case 'content': return 'Customize your email content using MJML.';
      case 'review': return 'Review your campaign settings before creating.';
      default: return '';
    }
  };

  const canProceedToContent = () => {
    const values = form.getValues();
    return values.name && values.template_id > 0 && values.segment_id > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={currentStep === 'content' ? "max-w-6xl" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{getStepTitle()}</DialogTitle>
              <DialogDescription>{getStepDescription()}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={currentStep === 'details' ? 'default' : 'secondary'}>1</Badge>
              <Badge variant={currentStep === 'content' ? 'default' : 'secondary'}>2</Badge>
              <Badge variant={currentStep === 'review' ? 'default' : 'secondary'}>3</Badge>
            </div>
          </div>
        </DialogHeader>
        
        {currentStep === 'details' && (
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Template</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={templatesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="segment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Segment</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={segmentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={segmentsLoading ? "Loading segments..." : "Select a segment"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id.toString()}>
                            {segment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="send_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Send (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        placeholder="Leave empty to save as draft"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleNextStep}
                disabled={!canProceedToContent()}
              >
                Next: Customize Content
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </Form>
        )}
        
        {currentStep === 'content' && selectedTemplate && (
          <div className="space-y-4">
            <EmailEditor
              initialContent={customContent}
              templateContent={selectedTemplate.mjml}
              onSave={handleSaveContent}
              onCancel={() => setCurrentStep('details')}
              isLoading={false}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSaveContent(customContent)}
              >
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {currentStep === 'review' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Campaign Name</h4>
                <p className="text-sm text-muted-foreground">{form.getValues('name')}</p>
              </div>
              <div>
                <h4 className="font-medium">Template</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate?.name}</p>
              </div>
              <div>
                <h4 className="font-medium">Target Segment</h4>
                <p className="text-sm text-muted-foreground">
                  {segments.find(s => s.id === form.getValues('segment_id'))?.name}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  {form.getValues('send_at') || 'Save as draft'}
                </p>
              </div>
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  Email Content
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentStep('content')}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </h4>
                <p className="text-sm text-muted-foreground">
                  {customContent ? 'Custom content created' : 'Using template content'}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="button" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}