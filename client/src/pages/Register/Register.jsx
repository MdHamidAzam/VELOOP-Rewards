import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "../Login/Login.module.css";

export default function Register() {
	const navigate = useNavigate();
	const { register } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await register(email.trim(), password);
			navigate("/login", { replace: true, state: { registrationSuccess: true } });
		} catch (registrationError) {
			if (registrationError.status === 409 || registrationError.code === "AUTH_ACCOUNT_EXISTS") {
				setError("An account already exists for that email. Sign in or use another email address.");
			} else {
				setError(registrationError.message || "Your account could not be created. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.eyebrow}>VELOOP Rewards</p>
				<h1>Create your account</h1>
				<p>Register with your email to participate in VELOOP giveaways.</p>
				<form onSubmit={submit}>
					<label htmlFor="register-email">Email</label>
					<input
						id="register-email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
						maxLength={254}
						autoComplete="email"
					/>
					<label htmlFor="register-password">Password</label>
					<input
						id="register-password"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
						minLength={8}
						autoComplete="new-password"
					/>
					{error && <p className={styles.error} role="alert">{error}</p>}
					<button className={styles.primaryButton} type="submit" disabled={loading}>
						{loading ? "Creating account..." : "Create account"}
					</button>
				</form>
				<p className={styles.accountPrompt}>Already registered? <Link to="/login">Sign in</Link></p>
			</section>
		</main>
	);
}