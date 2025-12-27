import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { profilesApi, teamsApi, teamMembersApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, UserPlus, Trash2, Shield, Mail } from 'lucide-react';
import type { Team, TeamMember } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Teams() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);


  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getAll();
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast({ title: 'Error', description: 'Failed to load teams', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (teamId: string) => {
    try {
      setMembersLoading(true);
      const data = await teamMembersApi.getByTeamId(teamId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      loadMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const handleCreateTeam = async () => {


    if (!newTeamName.trim()) {
      toast({ title: 'Error', description: 'Please enter a team name', variant: 'destructive' });
      return;
    }

    try {
      setCreating(true);
      const team = await teamsApi.create({
        name: newTeamName,
        description: newTeamDescription || null,
        owner_id: profile!.id,
      });

      // Owner is automatically added as a member in some setups, but here we might need to manually ensure it or depend on DB trigger.
      // Based on typical supabase patterns, we add the owner.
      await teamMembersApi.add(team.id, profile!.id, 'owner');

      toast({ title: 'Success', description: 'Team created successfully' });
      setCreateDialogOpen(false);
      setNewTeamName('');
      setNewTeamDescription('');
      loadTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast({ title: 'Error', description: 'Failed to create team', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;
    try {
      setInviting(true);
      const userToInvite = await profilesApi.getByEmail(inviteEmail.trim());
      if (!userToInvite) {
        toast({ title: 'Not Found', description: 'User with this email not found', variant: 'destructive' });
        return;
      }

      await teamMembersApi.add(selectedTeam.id, userToInvite.id, 'viewer');
      toast({ title: 'Success', description: `Invited ${inviteEmail}` });
      setInviteDialogOpen(false);
      setInviteEmail('');
      loadMembers(selectedTeam.id);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to invite user', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await teamMembersApi.remove(memberId);
      toast({ title: 'Removed', description: 'Member removed from team' });
      loadMembers(selectedTeam!.id);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Team <span className="text-[#2094f3] italic">Portal</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium italic opacity-80 mt-1">
                Collaborate and build with your collective genius.
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2094f3] hover:bg-[#1a7bc9] text-white font-black rounded-lg shadow-lg shadow-[#2094f3]/20">
                    <Plus className="mr-2 h-4 w-4" />
                    New Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Launch Team</DialogTitle>
                    <DialogDescription className="font-medium text-slate-500 italic">
                      Create a shared workspace for your organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Name</Label>
                      <Input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g. Design Elite"
                        className="rounded-xl border-slate-200 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                      <Textarea
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="What's this team about?"
                        className="rounded-xl border-slate-200 font-bold min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateTeam} disabled={creating} className="w-full bg-[#2094f3] hover:bg-[#1a7bc9] font-black rounded-xl h-12">
                      {creating ? 'Launching...' : 'Create Team'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] rounded-2xl bg-slate-50" />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <Users className="mx-auto h-16 w-16 text-slate-200" />
              <h3 className="mt-6 text-2xl font-black text-slate-900">No Teams Formed</h3>
              <p className="text-slate-400 font-bold italic mt-2">
                Great things are built together. Start your first team today.
              </p>
              <Button
                className="mt-8 bg-[#2094f3] hover:bg-[#1a7bc9] font-black rounded-xl px-8 h-12 shadow-xl shadow-[#2094f3]/20"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create My First Team
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Sidebar: Team List */}
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Managed Hubs</div>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 ${selectedTeam?.id === team.id
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl translate-x-1"
                        : "bg-white border-transparent hover:border-slate-100 text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Users className={`h-4 w-4 ${selectedTeam?.id === team.id ? "text-[#2094f3]" : "text-slate-300"}`} />
                        {team.owner_id === profile?.id && (
                          <span className="text-[8px] font-black uppercase bg-[#2094f3] text-white px-2 py-0.5 rounded-full">Owner</span>
                        )}
                      </div>
                      <div className="font-black text-sm truncate">{team.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content: Team Details */}
              <div className="lg:col-span-3">
                {selectedTeam && (
                  <Tabs defaultValue="members" className="space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-black text-slate-900 leading-tight">
                            {selectedTeam.name}
                          </h2>
                          <p className="text-slate-400 text-sm font-bold italic line-clamp-1">
                            {selectedTeam.description || 'No description provided.'}
                          </p>
                        </div>
                        <TabsList className="bg-slate-50 p-1 rounded-xl w-fit">
                          <TabsTrigger value="members" className="rounded-lg font-black text-xs px-6 data-[state=active]:bg-[#2094f3] data-[state=active]:text-white uppercase tracking-widest">Members</TabsTrigger>
                          <TabsTrigger value="settings" className="rounded-lg font-black text-xs px-6 data-[state=active]:bg-[#2094f3] data-[state=active]:text-white uppercase tracking-widest">Settings</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="members" className="mt-0">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Team Personnel</div>
                            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-slate-900 hover:bg-black text-white rounded-lg font-black text-[10px] uppercase tracking-widest px-4">
                                  <UserPlus className="mr-2 h-3 w-3" />
                                  Invite
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="rounded-2xl border-none shadow-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-black">Invite Member</DialogTitle>
                                  <DialogDescription className="font-medium text-slate-500 italic">
                                    Expand your collective by inviting a collaborator.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 text-[#2094f3]" />
                                      <Input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                        className="rounded-xl border-slate-200 font-bold pl-10"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleInvite} disabled={inviting} className="w-full bg-[#2094f3] hover:bg-[#1a7bc9] font-black rounded-xl h-12">
                                    {inviting ? 'Sending...' : 'Send Invitation'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <div className="divide-y divide-slate-50">
                            {membersLoading ? (
                              <div className="space-y-4">
                                {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full bg-slate-50" />)}
                              </div>
                            ) : members.map((member) => (
                              <div key={member.id} className="py-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-10 w-10 border-2 border-slate-50 ring-2 ring-[#2094f3]/5">
                                    <AvatarImage src={member.profile?.avatar_url || ''} />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-black">
                                      {member.profile?.email?.[0].toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                                      {member.profile?.email}
                                      {member.user_id === profile?.id && (
                                        <Badge variant="outline" className="text-[8px] font-black text-[#2094f3] border-[#2094f3]/20">You</Badge>
                                      )}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{member.role}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                  {selectedTeam.owner_id === profile?.id && member.user_id !== profile?.id && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                      onClick={() => handleRemoveMember(member.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Shield className={`h-4 w-4 ${member.role === 'owner' ? "text-[#2094f3]" : "text-slate-200"}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings" className="mt-0">
                        <div className="space-y-8">
                          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Team Configuration</div>
                          <div className="grid gap-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Edit Agency Name</Label>
                              <Input
                                value={selectedTeam.name}
                                className="rounded-xl border-slate-100 font-black text-lg h-12"
                                readOnly={selectedTeam.owner_id !== profile?.id}
                              />
                            </div>
                            {selectedTeam.owner_id === profile?.id && (
                              <div className="pt-6 border-t border-slate-50 mt-4">
                                <div className="flex items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100">
                                  <div>
                                    <div className="text-sm font-black text-red-600">Danger Zone</div>
                                    <div className="text-xs font-bold text-slate-400 italic">This will permanently dissolve the team and access to its forms.</div>
                                  </div>
                                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600 rounded-xl font-black text-xs px-6 uppercase tracking-widest">
                                    Delete Team
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
