import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AccountCardProps {
  onLogout: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ onLogout }) => {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">Account</CardTitle>
        <CardDescription className="text-xs">Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-3">
        {/* TODO: Could add user display info here if needed */}
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
