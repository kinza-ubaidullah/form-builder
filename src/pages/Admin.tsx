import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { profilesApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Zap, CheckCircle2, XCircle } from 'lucide-react';
import type { Profile } from '@/types';

export default function Admin() {
  const { profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profilesApi.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await profilesApi.updateRole(userId, newRole);
      setProfiles(profiles.map((p) => (p.id === userId ? { ...p, role: newRole as any } : p)));
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleUpgradeAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      let updates: any = {};

      if (action === 'approve') {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30); // 30 days from now

        updates = {
          is_premium: true,
          upgrade_requested: false,
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          subscription_status: 'active',
          subscription_amount: 20.00,
        };
      } else {
        updates = { upgrade_requested: false };
      }

      await profilesApi.updateStatus(userId, updates);

      setProfiles(profiles.map((p) => (p.id === userId ? { ...p, ...updates } : p)));

      toast({
        title: action === 'approve' ? 'Approved' : 'Rejected',
        description: `User upgrade request ${action}d successfully`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  if (currentProfile?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access this page
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const upgradeRequests = profiles.filter(p => p.upgrade_requested);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage users and system settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{profiles.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
                  {profiles.filter((p) => p.is_premium).length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
                  {upgradeRequests.length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
                  {profiles.filter((p) => p.role === 'admin').length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests" className="relative">
              Upgrade Requests
              {upgradeRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {upgradeRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Upgrade Requests</CardTitle>
                <CardDescription>Approve or reject premium activation requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : upgradeRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p>No pending requests.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upgradeRequests.map(profile => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.username}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-[10px] font-black tracking-widest text-[#2196F3] border-[#2196F3]/20">
                              {profile.payment_method || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-bold text-slate-600">
                              {profile.full_name || profile.username || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-black text-green-600">
                              ${profile.amount?.toFixed(2) || '0.00'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              {profile.transaction_id || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(profile.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleUpgradeAction(profile.id, 'reject')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleUpgradeAction(profile.id, 'approve')} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>View and manage premium subscriptions.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : profiles.filter(p => p.is_premium).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p>No active subscriptions.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.filter(p => p.is_premium).map(profile => {
                        const daysLeft = profile.subscription_end_date
                          ? Math.ceil((new Date(profile.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 0;
                        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
                        const isExpired = daysLeft <= 0;

                        return (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.username}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{profile.email}</TableCell>
                            <TableCell>
                              {profile.subscription_status === 'active' ? (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                                </Badge>
                              ) : profile.subscription_status === 'expired' ? (
                                <Badge variant="destructive">Expired</Badge>
                              ) : (
                                <Badge variant="outline">N/A</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {profile.subscription_start_date
                                ? new Date(profile.subscription_start_date).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {profile.subscription_end_date
                                ? new Date(profile.subscription_end_date).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className={`text-sm font-bold ${isExpired ? 'text-red-600' :
                                  isExpiringSoon ? 'text-amber-600' :
                                    'text-green-600'
                                }`}>
                                {daysLeft > 0 ? `${daysLeft} days` : isExpired ? 'Expired' : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-black text-green-600">
                                ${profile.subscription_amount?.toFixed(2) || '20.00'}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.username || 'N/A'}
                            </TableCell>
                            <TableCell>{profile.email || 'N/A'}</TableCell>
                            <TableCell>
                              {profile.is_premium ? (
                                <Badge className="bg-amber-500 hover:bg-amber-600"><Zap className="mr-1 h-3 w-3 fill-white" /> Premium</Badge>
                              ) : (
                                <Badge variant="outline">Free</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={profile.role === 'admin' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {profile.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {profile.id !== currentProfile.id && (
                                <Select
                                  value={profile.role}
                                  onValueChange={(value) => handleRoleChange(profile.id, value)}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
