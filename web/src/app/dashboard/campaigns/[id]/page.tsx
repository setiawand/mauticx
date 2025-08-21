'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Calendar, Users, Mail } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: number;
  name: string;
  template_id: number;
  segment_id: number;
  send_at?: string;
  status: string;
  custom_content?: string;
}

interface Template {
  id: number;
  name: string;
  mjml: string;
}

interface Segment {
  id: number;
  name: string;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaignDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch campaign
      const campaignResponse = await apiClient.get(`/campaigns/${campaignId}`) as Campaign;
      const campaignData = campaignResponse;
      setCampaign(campaignData);

      // Fetch template details
      if (campaignData && campaignData.template_id) {
        try {
          const templateResponse = await apiClient.get(`/templates/${campaignData.template_id}`) as Template;
          setTemplate(templateResponse);
        } catch (error) {
          console.error('Failed to fetch template:', error);
        }
      }

      // Fetch segment details
      if (campaignData && campaignData.segment_id) {
        try {
          const segmentResponse = await apiClient.get(`/segments/${campaignData.segment_id}`) as Segment;
          setSegment(segmentResponse);
        } catch (error) {
          console.error('Failed to fetch segment:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      toast.error('Failed to load campaign details');
      router.push('/dashboard/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sending': return 'default';
      case 'sent': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <PageContainer scrollable>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading campaign details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!campaign) {
    return (
      <PageContainer scrollable>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Campaign not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/campaigns">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
            <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{campaign.status}</div>
              <p className="text-xs text-muted-foreground">
                Current campaign status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Template</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{template?.name || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                Email template used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Segment</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segment?.name || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                Audience segment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>
                Basic details about this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Campaign Name</h4>
                <p className="text-sm">{campaign.name}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Template ID</h4>
                <p className="text-sm">{campaign.template_id}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Segment ID</h4>
                <p className="text-sm">{campaign.segment_id}</p>
              </div>
              
              {campaign.send_at && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Scheduled Send Time
                  </h4>
                  <p className="text-sm">{new Date(campaign.send_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>
                Content configuration for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Content Type</h4>
                <p className="text-sm">
                  {campaign.custom_content ? 'Custom Content' : 'Template Content'}
                </p>
              </div>
              
              {campaign.custom_content && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Custom Content</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-xs">
                      {campaign.custom_content.substring(0, 200)}
                      {campaign.custom_content.length > 200 && '...'}
                    </code>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}