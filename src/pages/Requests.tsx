import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MediaSearch from '../components/requests/MediaSearch';
import RequestList from '../components/requests/RequestList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import AdminRequestManager from '../components/admin/AdminRequestManager';

const RequestsPage = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("search");

  const handleRequestMade = () => {
    setRefreshKey(prev => prev + 1);
    // Switch to "my requests" tab after making a request
    setActiveTab("my_requests");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{t('media_requests')}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
          <TabsTrigger value="search">{t('new_request')}</TabsTrigger>
          <TabsTrigger value="my_requests">{t('my_requests')}</TabsTrigger>
          {profile?.role === 'admin' && (
            <TabsTrigger value="admin_manage">{t('admin_manage_requests')}</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="search" className="mt-6">
          <MediaSearch onRequestMade={handleRequestMade} />
        </TabsContent>
        <TabsContent value="my_requests" className="mt-6">
          <RequestList key={refreshKey} />
        </TabsContent>
        {profile?.role === 'admin' && (
          <TabsContent value="admin_manage" className="mt-6">
            <AdminRequestManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RequestsPage;