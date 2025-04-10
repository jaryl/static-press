
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Database, Loader2 } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(username, password);
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-3">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">DataScribe</h1>
          <p className="text-muted-foreground mt-1">Admin panel for your data collections</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>For demo purposes, use:</p>
          <p className="font-mono mt-1">Username: admin | Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
