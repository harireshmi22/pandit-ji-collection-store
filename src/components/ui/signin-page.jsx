"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

const Card = ({ children, className = "" }) => (
    <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>
);

const FormHeader = ({ title, subtitle }) => (
    <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
    </div>
);

const InputField = ({
    id,
    type,
    label,
    placeholder,
    value,
    onChange,
    icon: Icon,
    required = false,
    className = "",
}) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ${className}`}
                required={required}
            />
        </div>
    </div>
);

const PasswordField = ({
    id,
    label,
    placeholder,
    value,
    onChange,
    showPassword,
    onTogglePassword,
    required = false,
    className = "",
}) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
        </label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full h-11 pl-10 pr-10 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ${className}`}
                required={required}
            />
            <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    </div>
);

const Checkbox = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background"
        />
        <span className="text-muted-foreground select-none text-sm">{label}</span>
    </label>
);

const Button = ({
    type = "button",
    variant = "primary",
    onClick,
    children,
    className = "",
    fullWidth = false,
    disabled = false,
}) => {
    const baseStyles =
        "h-11 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-primary-foreground shadow-lg hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-secondary text-foreground",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        >
            {children}
        </button>
    );
};

const Divider = ({ text }) => (
    <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{text}</span>
        </div>
    </div>
);

const SocialButton = ({ onClick, children, isLoading = false }) => (
    <Button variant="outline" onClick={onClick} fullWidth disabled={isLoading}>
        {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        )}
        {children}
    </Button>
);

const AnimatedBlob = ({ color, position, delay = "" }) => (
    <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob ${delay}`} />
);

const ProgressDots = ({ activeIndex = 2 }) => (
    <div className="flex justify-center gap-2 pt-4">
        {[0, 1, 2].map((index) => {
            const classes = ["bg-white/40", "bg-white/60", "bg-white/80", "bg-white"];
            const score = index <= activeIndex ? 3 - (activeIndex - index) : 0;
            return <div key={index} className={`w-2 h-2 rounded-full ${classes[Math.max(score, 0)]}`} />;
        })}
    </div>
);

const HeroSection = ({ title, description, showProgress = true }) => (
    <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex rounded-full p-3 bg-white/10 backdrop-blur-sm text-white mb-4">
            <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white">{title}</h2>
        <p className="text-lg text-white/80">{description}</p>
        {showProgress ? <ProgressDots activeIndex={2} /> : null}
    </div>
);

const GradientBackground = ({ children }) => (
    <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/80 via-indigo-900/70 to-slate-900/85" />

        <div className="absolute inset-0">
            <AnimatedBlob color="bg-purple-500/30" position="top-0 -left-4" />
            <AnimatedBlob color="bg-cyan-500/30" position="top-0 -right-4" delay="animation-delay-2000" />
            <AnimatedBlob color="bg-indigo-500/30" position="-bottom-8 left-20" delay="animation-delay-4000" />
        </div>

        <div className="relative z-10 flex items-center justify-center p-8 lg:p-12 w-full">{children}</div>
    </div>
);

const FormFooter = ({ text, linkText, linkHref }) => (
    <p className="mt-6 text-center text-sm text-muted-foreground">
        {text}{" "}
        <Link href={linkHref} className="text-primary hover:opacity-80 font-medium transition-opacity duration-300">
            {linkText}
        </Link>
    </p>
);

export default function SignInPage({
    email,
    password,
    rememberMe,
    showPassword,
    isLoading,
    isGoogleLoading = false,
    error,
    onEmailChange,
    onPasswordChange,
    onRememberMeChange,
    onTogglePassword,
    onSubmit,
    onGoogleSignIn,
    forgotPasswordHref = "/forgot-password",
    signUpHref = "/signup",
}) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row w-full bg-background border border-gray-300 rounded-lg shadow-lg">
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md space-y-8">
                    <FormHeader title="Welcome back" subtitle="Sign in to your account to continue" />

                    <Card className="p-6 sm:p-8 shadow-sm">
                        {error ? (
                            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </div>
                        ) : null}

                        <form onSubmit={onSubmit} className="space-y-6">
                            <InputField
                                id="email"
                                type="email"
                                label="Email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={onEmailChange}
                                icon={Mail}
                                required
                            />

                            <PasswordField
                                id="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={onPasswordChange}
                                showPassword={showPassword}
                                onTogglePassword={onTogglePassword}
                                required
                            />

                            <div className="flex items-center justify-between text-sm">
                                <Checkbox id="remember" label="Remember me" checked={rememberMe} onChange={onRememberMeChange} />
                                <Link href={forgotPasswordHref} className="text-primary hover:opacity-80 font-medium transition-opacity duration-300">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>

                            <Divider text="Or continue with" />

                            <SocialButton onClick={onGoogleSignIn} isLoading={isGoogleLoading}>Continue with Google</SocialButton>
                        </form>

                        <FormFooter text="Don't have an account?" linkText="Sign up" linkHref={signUpHref} />
                    </Card>
                </div>
            </div>

            <GradientBackground>
                <HeroSection
                    title="Secure Authentication"
                    description="Your data is protected with industry-standard encryption and security measures. Sign in with confidence."
                    showProgress
                />
            </GradientBackground>
        </div>
    );
}
