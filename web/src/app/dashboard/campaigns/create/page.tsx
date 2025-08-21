'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { EmailEditor } from '@/components/campaigns/email-editor';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

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

export default function CreateCampaignPage() {
  const router = useRouter();
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
  useEffect(() => {
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

  useEffect(() => {
    fetchTemplates();
    fetchSegments();
  }, []);

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
      router.push('/dashboard/campaigns');
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
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

  // Watch form values for reactive validation
  const watchedValues = form.watch(['name', 'template_id', 'segment_id']);
  
  const canProceedToContent = () => {
    const [name, template_id, segment_id] = watchedValues;
    const canProceed = name && name.trim() !== '' && template_id > 0 && segment_id > 0;
    return canProceed;
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/campaigns')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
              <p className="text-muted-foreground">{getStepDescription()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={currentStep === 'details' ? 'default' : 'secondary'}>1</Badge>
            <Badge variant={currentStep === 'content' ? 'default' : 'secondary'}>2</Badge>
            <Badge variant={currentStep === 'review' ? 'default' : 'secondary'}>3</Badge>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Template</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value > 0 ? field.value.toString() : ""}
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
                            value={field.value > 0 ? field.value.toString() : ""}
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
                  </div>
                  
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
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={!canProceedToContent()}
                  >
                    Next: Customize Content
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 'content' && selectedTemplate && (
          <div className="-mx-4 md:-mx-6">
            <div className="px-2 md:px-4 space-y-4">
              <EmailEditor
                initialContent={customContent}
                templateContent={selectedTemplate.mjml}
                onSave={handleSaveContent}
                onCancel={() => setCurrentStep('details')}
                isLoading={false}
              />
              
              <div className="flex justify-between px-2">
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
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Review Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Campaign Name</h4>
                    <p className="text-sm text-muted-foreground">{form.getValues('name')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Template</h4>
                    <p className="text-sm text-muted-foreground">{selectedTemplate?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Target Segment</h4>
                    <p className="text-sm text-muted-foreground">
                      {segments.find(s => s.id === form.getValues('segment_id'))?.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      {form.getValues('send_at') || 'Save as draft'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">Email Content</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentStep('content')}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {customContent ? 'Custom content created' : 'Using template content'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}