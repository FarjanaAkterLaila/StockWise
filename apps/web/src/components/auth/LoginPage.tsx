import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  AuthWrapper,
  AuthCard,
  BrandHeader,
  LogoBadge,
  AppTitle,
  AppSubtitle,
  FormWrap,
  InputGroup,
  InputLabel,
  InputFieldWrap,
  StyledInput,
  ErrorAlert,
  SuccessAlert,
  SubmitButton,
  AuthFooter,
  SwitchModeBtn,
  DemoCredentialsCard,
  CredentialRow,
  RoleBadge,
} from "./LoginPage.styles";

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signup(email, password, fullName);
        setSuccess("Account registered! Please sign in with your credentials.");
        setIsSignUp(false);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(
        (err as Error)?.message ||
          "Authentication failed. Please verify credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <AuthCard>
        <BrandHeader>
          <LogoBadge>
            <Boxes size={28} />
          </LogoBadge>
          <AppTitle>StockWise ERP</AppTitle>
          <AppSubtitle>
            Multiplan Computer City Hardware &amp; Component POS
          </AppSubtitle>
        </BrandHeader>

        {error && (
          <ErrorAlert>
            <AlertCircle size={16} />
            <span>{error}</span>
          </ErrorAlert>
        )}

        {success && (
          <SuccessAlert>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </SuccessAlert>
        )}

        <FormWrap onSubmit={handleSubmit}>
          {isSignUp && (
            <InputGroup>
              <InputLabel>Full Name</InputLabel>
              <InputFieldWrap>
                <User size={16} />
                <StyledInput
                  type="text"
                  placeholder="e.g. Tanvir Hasan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </InputFieldWrap>
            </InputGroup>
          )}

          <InputGroup>
            <InputLabel>Email Address</InputLabel>
            <InputFieldWrap>
              <Mail size={16} />
              <StyledInput
                type="email"
                placeholder="operator@stockwise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputFieldWrap>
          </InputGroup>

          <InputGroup>
            <InputLabel>Password</InputLabel>
            <InputFieldWrap>
              <Lock size={16} />
              <StyledInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputFieldWrap>
          </InputGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In to ERP"}</span>
            <ArrowRight size={16} />
          </SubmitButton>
        </FormWrap>

        <AuthFooter>
          <span>
            {isSignUp ? "Already have an account?" : "Need an operator account?"}
          </span>
          <SwitchModeBtn
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
          >
            {isSignUp ? "Sign In" : "Register"}
          </SwitchModeBtn>
        </AuthFooter>

        <DemoCredentialsCard>
          <CredentialRow>
            <span>Supabase Auth Ready</span>
            <RoleBadge $role="admin">Admin / Staff</RoleBadge>
          </CredentialRow>
          <span>Secure JWT sessions with role-based route permissions</span>
        </DemoCredentialsCard>
      </AuthCard>
    </AuthWrapper>
  );
};
