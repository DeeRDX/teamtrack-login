import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react";
import { signup } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface SignupFormData {
  fullName: string;
  email: string;
  enumber: string;
  password: string;
  confirmPassword: string;
  role_id: string | null;
  team_id: string |null;
  asset_id: string |null;
  
}

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await signup(data);
      setSuccessMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Sign up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-login-gradient relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TeamTrack</span>
          </div>

          <div className="space-y-5 relative z-10">
            <h1 className="text-[2.75rem] font-bold leading-[1.15] text-white">
              Join your team<br />on TeamTrack.
            </h1>
            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              Create your account to start tracking tasks, collaborating with teammates, and delivering on time.
            </p>
          </div>

          <div className="text-xs text-white/60 relative z-10">
            © {new Date().getFullYear()} TeamTrack
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-full lg:w-[55%] items-center justify-center p-8 bg-background">
          <div className="w-full max-w-[420px] space-y-6">
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">TeamTrack</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
              <p className="text-muted-foreground text-sm">Sign up to get started with TeamTrack</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="dummy"
                  className="h-11"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dummy@toto.com"
                  className="h-11"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enumber" className="text-sm font-medium">Employee Number</Label>
                <Input
                  id="enumber"
                  type="text"
                  placeholder="E112233"
                  className="h-11"
                  {...register("enumber", {
                    required: "Employee number is required",
                  })}
                />
                {errors.enumber && <p className="text-sm text-destructive">{errors.enumber.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="dummy@123"
                    className="h-11 pr-10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="dummy@123"
                    className="h-11 pr-10"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-destructive">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-primary">{successMessage}</p>
                </div>
              )}
            </form>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
