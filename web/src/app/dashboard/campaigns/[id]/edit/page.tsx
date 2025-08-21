'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import PageContainer from '@/components/layout/page-container';
import { EmailEditor } from '@/components/campaigns/email-editor';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

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

interface Campaign {
  id: number;
  name: string;
  template_id: number;
  segment_id: number;
  send_at?: string;
  status: string;
  custom_content?: string;
}

type Step = 'details' | 'content' | 'review';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
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

  // Fetch campaign data
  const fetchCampaign = async () => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}`);
      // Backend returns campaign data directly, not wrapped in { data: ... }
      const campaignData = response as Campaign;
      
      // Check if campaignData exists
      if (!campaignData || !campaignData.id) {
        console.error('Campaign data not found');
        toast.error('Campaign not found');
        router.push('/dashboard/campaigns');
        return;
      }
      
      setCampaign(campaignData);
      
      // Update form with campaign data
      form.reset({
        name: campaignData.name || '',
        template_id: campaignData.template_id || 0,
        segment_id: campaignData.segment_id || 0,
        send_at: campaignData.send_at || '',
        custom_content: campaignData.custom_content || '',
      });
      
      setCustomContent(campaignData.custom_content || '');
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      toast.error('Failed to load campaign');
      router.push('/dashboard/campaigns');
    }
  };

  // Fetch templates
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

  // Fetch segments
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
    fetchCampaign();
    fetchTemplates();
    fetchSegments();
  }, [campaignId]);

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
  }, [watchedTemplateId, templates]);

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
    form.setValue('custom_content', content);
    toast.success('Email content saved!');
    setCurrentStep('review');
  };

  const onSubmit = async (values: CampaignFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        template_id: values.template_id,
        segment_id: values.segment_id,
        send_at: values.send_at || null,
        custom_content: customContent || null,
      };
      
      await apiClient.put(`/campaigns/${campaignId}`, payload);
      toast.success('Campaign updated successfully!');
      router.push('/dashboard/campaigns');
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast.error('Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function for next button
  const canProceedToContent = () => {
    const name = form.watch('name');
    const template_id = form.watch('template_id');
    const segment_id = form.watch('segment_id');
    
    return name && template_id > 0 && segment_id > 0;
  };

  if (!campaign) {
    return (
      <PageContainer scrollable>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Campaign</h2>
            <p className="text-muted-foreground">
              Update your email marketing campaign
            </p>
          </div>
        </div>

        {/* Step 1: Campaign Details */}
        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Update the basic information for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="send_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Template</FormLabel>
                        <Select 
                          value={field.value > 0 ? field.value.toString() : ''} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templatesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading templates...
                              </SelectItem>
                            ) : (
                              templates.map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name}
                                </SelectItem>
                              ))
                            )}
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
                          value={field.value > 0 ? field.value.toString() : ''} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a segment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {segmentsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading segments...
                              </SelectItem>
                            ) : (
                              segments.map((segment) => (
                                <SelectItem key={segment.id} value={segment.id.toString()}>
                                  {segment.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  disabled={!canProceedToContent()}
                >
                  Next: Customize Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Email Content */}
        {currentStep === 'content' && (
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>
                Customize your email content using MJML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailEditor
                initialContent={customContent}
                onSave={handleSaveContent}
                onCancel={() => setCurrentStep('details')}
                isLoading={false}
              />
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleSaveContent(customContent)}
                >
                  Save & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Update</CardTitle>
              <CardDescription>
                Review your changes before updating the campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {form.getValues('send_at') || 'No schedule set'}
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
                      Edit
                    </Button>
                  </h4>
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
                  {isLoading ? 'Updating...' : 'Update Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}