import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInUsername || !signInPassword) {
      toast({
        title: 'Error',
        description: 'Please enter username and password',
        variant: 'destructive',
      });
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(signInUsername)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(signInUsername, signInPassword);
    setLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpUsername || !signUpPassword) {
      toast({
        title: 'Error',
        description: 'Please enter username and password',
        variant: 'destructive',
      });
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(signUpUsername)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(signUpUsername, signUpPassword);
    setLoading(false);

    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-50 p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl shadow-[0_0_100px_rgba(37,130,235,0.2)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-2 border-primary/30 shadow-[0_20px_60px_-15px_rgba(37,130,235,0.3)] backdrop-blur-md bg-white/90 relative overflow-hidden group">
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(37,130,235,0.05)] pointer-events-none" />

          <CardHeader className="space-y-2 pb-6">
            <div className="flex justify-center mb-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-3 bg-primary/10 rounded-2xl shadow-inner cursor-default"
              >
                <Layout className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-center tracking-tight text-slate-900">
              Form Builder
            </CardTitle>
            <CardDescription className="text-center text-slate-500 font-medium">
              Join thousands of creators building better forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100/80 rounded-lg">
                <TabsTrigger
                  value="signin"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-semibold"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-semibold"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0 outline-none">
                <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username" className="text-sm font-semibold text-slate-700">Username</Label>
                    <Input
                      id="signin-username"
                      type="text"
                      placeholder="Enter your username"
                      value={signInUsername}
                      onChange={(e) => setSignInUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="off"
                      className="bg-white/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700">Password</Label>
                      <Link to="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-[0_10px_20px_-5px_rgba(37,130,235,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(37,130,235,0.5)] active:scale-[0.98] transition-all bg-primary hover:bg-primary/95" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 outline-none">
                <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-semibold text-slate-700">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signUpUsername}
                      onChange={(e) => setSignUpUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="off"
                      className="bg-white/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-11"
                    />
                    <p className="text-[10px] text-slate-500 font-medium pl-1">
                      Only letters, numbers, and underscores allowed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm h-11"
                    />
                    <p className="text-[10px] text-slate-500 font-medium pl-1">
                      Minimum 6 characters for security
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-[0_10px_20px_-5px_rgba(37,130,235,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(37,130,235,0.5)] active:scale-[0.98] transition-all bg-primary hover:bg-primary/95" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 justify-center pt-2">
            <div className="w-full h-px bg-slate-100" />
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By continuing, you agree to our <Link to="#" className="text-slate-600 hover:text-primary transition-colors">Terms of Service</Link> and <Link to="#" className="text-slate-600 hover:text-primary transition-colors">Privacy Policy</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
