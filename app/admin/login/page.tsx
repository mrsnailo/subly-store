import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin · Subly" };

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <a className="logo" href="/">
          <span className="mark">
            <span />
          </span>
          Subly
        </a>
        <h1>Owner sign in</h1>
        <p className="sub">Manage your subscription store.</p>
        <LoginForm />
        <p style={{ marginTop: 18 }}>
          <a className="muted-link" href="/">
            ← Back to store
          </a>
        </p>
      </div>
    </div>
  );
}
