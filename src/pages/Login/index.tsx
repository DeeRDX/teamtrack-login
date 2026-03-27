import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, BarChart3, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { token, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await loginApi(data.email, data.password);
      login(response.user, response.token);
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage("Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Left panel - branding */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-login-gradient relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-white/5" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TeamTrack</span>
          </div>

          <div className="space-y-5 relative z-10">
            <h1 className="text-[2.75rem] font-bold leading-[1.15] text-white">
              Track your team's<br />work,<br />effortlessly.
            </h1>
            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              Streamline workflows, manage resources, and deliver projects on time with the next generation of enterprise task management.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white/20" />
                <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white/20" />
                <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white/20" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">Active Now</span>
            </div>
            <p className="text-sm text-white/80 italic leading-relaxed">
              "TeamTrack changed how our engineering department syncs across timezones."
            </p>
          </div>
        </div>

        {/* Right panel - login form */}
        <div className="flex w-full lg:w-[55%] items-center justify-center p-8 bg-background">
          <div className="w-full max-w-[420px] space-y-7">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">TeamTrack</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-muted-foreground text-sm">Sign in to your TeamTrack account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-11"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <button type="button" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 pr-10"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">{errorMessage}</p>
                    <p className="text-xs text-destructive/80 mt-0.5">Please check your credentials and try again.</p>
                  </div>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground tracking-wider font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" className="h-11 text-sm font-medium">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="h-11 text-sm font-medium">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                SSO
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Start free trial
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-background text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} TeamTrack. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button type="button" className="hover:text-foreground transition-colors">Privacy Policy</button>
          <button type="button" className="hover:text-foreground transition-colors">Terms of Service</button>
          <button type="button" className="hover:text-foreground transition-colors">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
