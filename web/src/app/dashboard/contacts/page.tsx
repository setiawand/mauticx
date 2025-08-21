'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Mail, Phone, Building, Upload } from 'lucide-react';
import { AddContactModal } from '@/components/contacts/add-contact-modal';
import { BulkUploadModal } from '@/components/contacts/bulk-upload-modal';
import { apiClient, Contact } from '@/lib/api-client';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/contacts') as Contact[] | { data: Contact[] };
      // API returns array directly, not wrapped in data object
      const contactsData = Array.isArray(response) ? response : (response.data || []);
      setContacts(contactsData);
      setTotalContacts(contactsData.length);
      setActiveSubscribers(contactsData.filter((c: Contact) => c.status === 'active').length);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
      setContacts([]);
      setTotalContacts(0);
      setActiveSubscribers(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleContactAdded = () => {
    fetchContacts();
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
            <p className="text-muted-foreground">
              Manage your contact database and subscriber lists
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
            <Button variant="outline" onClick={() => setIsBulkUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {totalContacts === 0 ? 'No contacts yet' : `${totalContacts} total contacts`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscribers === 0 ? 'No active subscribers' : `${activeSubscribers} active subscribers`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading contacts...</div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first contact.</p>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={() => setIsModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Contact
                </Button>
                <Button variant="outline" onClick={() => setIsBulkUploadModalOpen(true)} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload Contacts
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contact.email}</span>
                      </div>
                      {contact.attributes && (
                        <div className="mt-2 space-y-1">
                          {(contact.attributes.firstName || contact.attributes.lastName) && (
                            <div className="text-sm text-muted-foreground">
                              {contact.attributes.firstName} {contact.attributes.lastName}
                            </div>
                          )}
                          {contact.attributes.phone && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{contact.attributes.phone}</span>
                            </div>
                          )}
                          {contact.attributes.company && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>{contact.attributes.company}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {contact.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      contact.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddContactModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onContactAdded={handleContactAdded}
       />
      
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleContactAdded}
      />
      </div>
    </PageContainer>
  );
}