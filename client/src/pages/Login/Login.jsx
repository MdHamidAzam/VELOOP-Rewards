import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./Login.module.css";
import { DEMO_MODE, DEMO_USERS } from "../../services/demoData.js";

export default function Login() {
	const navigate = useNavigate();
	const { devLogin, isAuthenticated } = useAuth();
	const [userId, setUserId] = useState("VE10025");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	if (isAuthenticated) return <main className={styles.page}><section className={styles.card}><p className={styles.eyebrow}>Development account</p><h1>You are signed in</h1><p>Return to the giveaway to review your participation and reward status.</p><button className={styles.primaryButton} type="button" onClick={() => navigate("/")}>Back to giveaways</button></section></main>;

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError(null);
		try { await devLogin(userId); navigate("/"); } catch (loginError) { setError(loginError.message); } finally { setLoading(false); }
	};

	return <main className={styles.page}><section className={styles.card}><p className={styles.eyebrow}>VELOOP Rewards development access</p><h1>Sign in to participate</h1><p>Use a development user ID for this local demo environment.</p><form onSubmit={submit}><label htmlFor="user-id">User ID</label>{DEMO_MODE ? <select id="user-id" value={userId} onChange={(event) => setUserId(event.target.value)}>{DEMO_USERS.map((user) => <option key={user.id} value={user.id}>{user.label}</option>)}</select> : <input id="user-id" value={userId} onChange={(event) => setUserId(event.target.value)} required />}<p className={styles.note}>Development authentication only. This is not production account authentication.</p>{error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button></form></section></main>;
}
