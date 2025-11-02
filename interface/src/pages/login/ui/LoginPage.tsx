import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { ROUTES } from "@/shared/config";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui";
import LogoBRUTM from "@/shared/assets/logo.svg";
import { useToast, useAuth } from "@/shared/lib/hook";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const generateJWT = () => {
    // Generate a simple fake JWT token
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "icea",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
    const signature = btoa(Math.random().toString(36).substring(2, 15));
    return `${header}.${payload}.${signature}`;
  };

  const verifyCredentials = (username: string, password: string): boolean => {
    // Simulate credential verification
    const credentials = `${username}:${password}`;
    return credentials === import.meta.env.VITE_CREDENTIALS;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      if (verifyCredentials(username, password)) {
        const token = generateJWT();
        sessionStorage.setItem("accessToken", token);
        toast({
          title: "Login Successful",
          description: "Welcome to the BR-UTM monitoring system",
        });

        login();

        navigate(from, { replace: true });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1 items-center">
          <img
            src={LogoBRUTM}
            alt="BR-UTM Logo"
            className="h-30 w-30 rounded-full"
          />
          <CardTitle className="text-2xl text-center text-white">
            BR-UTM Manager
          </CardTitle>
          <p className="text-sm text-center text-gray-400">
            Sign in to access the drone management system
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
