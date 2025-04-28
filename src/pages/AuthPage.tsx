import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@/shared/schema";
import { Loader2, Check, X, Eye, EyeOff, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { verifyNsatRegistration } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, resetPasswordMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const loginForm = useForm<Pick<InsertUser, "email" | "password">>({
    resolver: zodResolver(insertUserSchema.pick({ email: true, password: true })),
    defaultValues: { email: "", password: "" }
  });

  const forgotPasswordForm = useForm<Pick<InsertUser, "email">>({
    resolver: zodResolver(insertUserSchema.pick({ email: true })),
    defaultValues: { email: "" }
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      passingYear: new Date().getFullYear(),
      isNsatRegistered: false,
      needsInterviewPrep: false
    }
  });

  const handleForgotPassword = async (data: { email: string }) => {
    try {
      await resetPasswordMutation.mutateAsync(data.email);
      toast.success("Password reset email sent! Please check your inbox.");
      setShowForgotPassword(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset email. Please try again.");
    }
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await loginMutation.mutateAsync(data);
      setLoginError(null); // Clear any previous error
      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        setLoginError("Invalid email or password. Please try again.");
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError("Invalid email or password. Please try again.");
      }
    }
  };

  const handleRegister = async (data: InsertUser) => {
    try {
      await registerMutation.mutateAsync(data);
      setRegisterError(null); // Clear any previous error
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.status === 409) {
        setRegisterError("This email is already registered. Please use a different email.");
      } else if (error.response?.data?.message) {
        setRegisterError(error.response.data.message);
      } else {
        setRegisterError("This email is already registered. Please use a different email.");
      }
    }
  };

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const handleNsatVerification = async (email: string) => {
    try {
      setIsVerifying(true);
      const bearerToken = process.env.VITE_NSAT_BEARER_TOKEN;
      if (!bearerToken) {
        toast.error("NSAT verification token not configured");
        return;
      }

      await verifyNsatRegistration(email, bearerToken);
      registerForm.setValue("isNsatRegistered", true);
      toast.success("NSAT registration verified successfully!");
    } catch (error) {
      console.error("NSAT verification failed:", error);
      toast.error("Failed to verify NSAT registration");
      registerForm.setValue("isNsatRegistered", false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-5 bg-muted/40 backdrop-blur">
      <div className="md:col-span-3 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-background/95">
            <CardContent className="pt-6">
              <Tabs defaultValue="login">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="email"
                                  placeholder="Enter your email" 
                                  {...field} 
                                />
                                <AnimatePresence>
                                  {field.value && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      {loginForm.formState.errors.email ? (
                                        <X className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <Check className="h-4 w-4 text-green-500" />
                                      )}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <div className="flex justify-end">
                              <Button 
                                type="button" 
                                variant="link" 
                                className="px-0 py-0 h-auto text-xs"
                                onClick={() => setShowForgotPassword(true)}
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </motion.div>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                  onClick={() => handleNsatVerification(field.value)}
                                  disabled={isVerifying || !field.value}
                                >
                                  {isVerifying ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Verify NSAT"
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="tel" 
                                  placeholder="10-digit mobile number" 
                                  {...field} 
                                />
                                <AnimatePresence>
                                  {field.value && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      {registerForm.formState.errors.phoneNumber ? (
                                        <X className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <Check className="h-4 w-4 text-green-500" />
                                      )}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a strong password"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    calculatePasswordStrength(e.target.value);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            {field.value && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2"
                              >
                                <Progress value={passwordStrength} className={`h-1 ${getStrengthColor(passwordStrength)}`} />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Password strength: {passwordStrength <= 25 ? "Weak" : passwordStrength <= 50 ? "Fair" : passwordStrength <= 75 ? "Good" : "Strong"}
                                </p>
                              </motion.div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="passingYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>12th Class Passing Year</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              >
                                {yearOptions.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="isNsatRegistered"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Are you registered for NSAT?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(value === "true");
                                }}
                                defaultValue={field.value.toString()}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="true" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Yes
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="false" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    No
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="needsInterviewPrep"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Do you need interview preparation?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => field.onChange(value === "true")}
                                defaultValue={field.value ? "true" : "false"}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="true" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Yes
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="false" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    No
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </motion.div>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex bg-muted items-center justify-center p-8"
      >
        <div className="max-w-md">
          <img
            src="https://media-hosting.imagekit.io//e60a0a3fac904c2a/WhatsApp_Image_2025-01-26_at_20.14.19-removebg-preview%20(3).png?Expires=1834242508&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=nVFdXSeeo14FtjV6G~ppAgawYVuWM5ZBFu3VmE~6EUH79Qe3QJ479US4D8pggGisa~3D5nKS0ICnJFBkwZyIV8iDLMX6LMTxPnoH9OkOnaYACbTTPgISyWVxr33MreB2LGvj0ePD5wi-weKMOaF-jYY9nr0AXGiYtUbOpCvRgws7RsDMKcTtO8xA~HP9Jim90PxyNhfp1842BWY~GDnlguAKH87V-Q-5RB8JJ6q~-wO9gX-ScIP26GqRVmXMQPmo4uuA6JH4fVvc1MjUKbBHtQBZ-3xFP0pAJax3I2lVLNX1EP2kHTpJuUTwwnLBCnkMNwst3BinXaixwg6I~kdkLw__"
            alt="REstart LMS"
            className="rounded-lg mb-8 w-32 mx-auto"
          />
          <h2 className="text-3xl font-bold mb-4 text-center">
            Welcome to REstart LMS
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-center">
              Join our platform to prepare for the NSAT exam with comprehensive study materials and mock tests.
              Track your progress and improve your chances of success.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Access to comprehensive study materials
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Practice with realistic mock tests
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Track your progress with analytics
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Learn at your own pace
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address below and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="email"
                          placeholder="Enter your email" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Send Reset Link
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}