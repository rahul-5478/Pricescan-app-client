import { Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  return (
    <AuthForm
      title="CREATE ACCOUNT"
      subtitle="AI-POWERED PRICE INTELLIGENCE"
      fields={[
        { name:"name",     label:"Operator Name",   placeholder:"Jane Smith" },
        { name:"email",    label:"Email Address",   type:"email",    placeholder:"operator@domain.com" },
        { name:"password", label:"Password",         type:"password", placeholder:"Min 6 characters" },
      ]}
      submitLabel="CREATE ACCESS"
      onSubmit={({ email, password, name }) => register(email, password, name)}
      footer={<>Have an account? <Link to="/login" style={{ color:"var(--cyan)" }}>Sign in</Link></>}
    />
  );
}
