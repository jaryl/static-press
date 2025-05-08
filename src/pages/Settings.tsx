import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnvironmentVariables from '../components/settings/EnvironmentVariables';
import SchemaCard from '../components/settings/SchemaCard';
import AccountCard from '../components/settings/AccountCard';
import AboutCard from '../components/settings/AboutCard';
import SiteManagementCard from '../components/settings/SiteManagementCard';
import Container from '@/components/layout/Container';
import { PrimaryHeader } from '@/components/layout/PrimaryHeader';
import { SecondaryHeader } from '@/components/layout/SecondaryHeader';
import { Sidebar } from '@/components/layout/sidebar';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const useRemoteData = import.meta.env.VITE_USE_REMOTE_DATA === 'true';
  const apiBaseUrl = useRemoteData
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.VITE_DEV_SERVER_URL;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Container>
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <PrimaryHeader title="Settings" />
        <SecondaryHeader className="mb-2">Manage your account and application settings</SecondaryHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-5">
              <EnvironmentVariables />

              <SchemaCard
                useRemoteData={useRemoteData}
                apiBaseUrl={apiBaseUrl}
              />

              <SiteManagementCard />
            </div>

            <div className="space-y-5">
              <AccountCard onLogout={handleLogout} />

              <AboutCard />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Settings;
