import { AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";
import { Footer } from "../components/nav";
export default function SignupPage() {
  return (
    <>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
      <Footer />
    </>
  );
}
