import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./Login.module.css";
import { DEMO_MODE, DEMO_USERS } from "../../services/demoData.js";

export default function Login() {
	const navigate = useNavigate();
	const { devLogin, login, isAuthenticated } = useAuth();
	const [userId, setUserId] = useState("VE10025");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	if (isAuthenticated) return <main className={styles.page}><section className={styles.card}><p className={styles.eyebrow}>Development account</p><h1>You are signed in</h1><p>Return to the giveaway to review your participation and reward status.</p><button className={styles.primaryButton} type="button" onClick={() => navigate("/")}>Back to giveaways</button></section></main>;

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if (DEMO_MODE) await devLogin(userId);
			else await login(email, password);
			navigate("/");
		} catch (loginError) { setError(loginError.message); } finally { setLoading(false); }
	};

	return <main className={styles.page}><section className={styles.card}><p className={styles.eyebrow}>{DEMO_MODE ? "VELOOP Rewards development access" : "VELOOP Rewards account access"}</p><h1>Sign in to participate</h1><p>{DEMO_MODE ? "Use a development user ID for this local demo environment." : "Use your VELOOP account to continue."}</p><form onSubmit={submit}>{DEMO_MODE ? <><label htmlFor="user-id">User ID</label><select id="user-id" value={userId} onChange={(event) => setUserId(event.target.value)}>{DEMO_USERS.map((user) => <option key={user.id} value={user.id}>{user.label}</option>)}</select><p className={styles.note}>Development authentication only. This is not production account authentication.</p></> : <><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" /></>}{error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button></form></section></main>;
}
