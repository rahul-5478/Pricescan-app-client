import { Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <AuthForm
      title="SYSTEM LOGIN"
      subtitle="AI-POWERED PRICE INTELLIGENCE"
      fields={[
        { name:"email",    label:"Email Address", type:"email",    placeholder:"operator@domain.com" },
        { name:"password", label:"Password",       type:"password", placeholder:"••••••••" },
      ]}
      submitLabel="AUTHENTICATE"
      onSubmit={({ email, password }) => login(email, password)}
      footer={<>No account? <Link to="/register" style={{ color:"var(--cyan)" }}>Register access</Link></>}
    />
  );
}
