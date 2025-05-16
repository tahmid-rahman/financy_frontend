import { Footer } from "../components/nav";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <Footer />
    </AuthLayout>
  );
}
