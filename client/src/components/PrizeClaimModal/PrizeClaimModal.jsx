import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import styles from "./PrizeClaimModal.module.css";

const PHYSICAL_FIELDS = [
	["name", "Full name"],
	["phone", "Phone number"],
	["address", "Complete address"],
	["city", "City"],
	["state", "State"],
	["PIN", "PIN code"],
];

export default function PrizeClaimModal({ winner, claim, loading, error, onCancel, onSubmit }) {
	const closeButtonRef = useRef(null);
	const previousFocus = useRef(document.activeElement);
	const [form, setForm] = useState({});
	const isPhysical = winner.claimType === "PHYSICAL";

	useEffect(() => {
		closeButtonRef.current?.focus();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const handleKeyDown = (event) => {
			if (event.key === "Escape" && !loading) onCancel();
			if (event.key !== "Tab") return;
			const dialog = closeButtonRef.current?.closest("[role=dialog]");
			const focusable = dialog?.querySelectorAll("button:not([disabled]), input, textarea");
			if (!focusable?.length) return;
			if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
			if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
			previousFocus.current?.focus?.();
		};
	}, [loading, onCancel]);

	if (claim) return <div className={styles.backdrop} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="claim-status-title"><button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onCancel} aria-label="Close claim status"><FiX aria-hidden="true" /></button><p className={styles.eyebrow}>Prize claim</p><h2 id="claim-status-title">Claim {claim.status.toLowerCase()}</h2><p>Your claim is currently {claim.status.toLowerCase()}. Our team will process the prize details securely.</p></section></div>;

	const fields = isPhysical ? PHYSICAL_FIELDS : [["email", "Gift card email address"]];
	return <div className={styles.backdrop} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="claim-title"><button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onCancel} disabled={loading} aria-label="Close claim form"><FiX aria-hidden="true" /></button><p className={styles.eyebrow}>Claim your prize</p><h2 id="claim-title">{winner.prizeName}</h2><p>{isPhysical ? "Provide the delivery details required for this physical prize." : "Enter the email address where the gift card should be delivered."}</p><form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className={styles.fields}>{fields.map(([name, label]) => <label key={name}><span>{label}</span>{name === "address" ? <textarea name={name} value={form[name] ?? ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required /> : <input name={name} type={name === "email" ? "email" : "text"} value={form[name] ?? ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required />}</label>)}</div>{error && <p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><button className={styles.cancelButton} type="button" onClick={onCancel} disabled={loading}>Cancel</button><button className={styles.submitButton} type="submit" disabled={loading}>{loading ? "Submitting claim..." : "Submit claim"}</button></div></form></section></div>;
}
