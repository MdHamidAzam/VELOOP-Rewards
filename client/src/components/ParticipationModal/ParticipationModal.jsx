import { useEffect, useRef } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import styles from "./ParticipationModal.module.css";

function formatAmount(amount, currency) {
	if (!Number.isFinite(amount)) return "Unavailable";
	return `${amount.toLocaleString()} ${currency ?? ""}`.trim();
}

export default function ParticipationModal({
	prize,
	wallet,
	loading,
	error,
	onCancel,
	onConfirm,
}) {
	const closeButtonRef = useRef(null);
	const amount = prize.entryFee?.amount;
	const currency = prize.entryFee?.currency;
	const balanceAfter = wallet && Number.isFinite(amount) && wallet.balance >= amount
		? wallet.balance - amount
		: null;

	useEffect(() => {
		closeButtonRef.current?.focus();
		const handleKeyDown = (event) => {
			if (event.key === "Escape" && !loading) onCancel();
			if (event.key !== "Tab") return;

			const focusable = event.currentTarget.querySelectorAll("button:not([disabled]), [href], select, input, textarea");
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		const dialog = closeButtonRef.current?.closest("[role=dialog]");
		dialog?.addEventListener("keydown", handleKeyDown);
		return () => dialog?.removeEventListener("keydown", handleKeyDown);
	}, [loading, onCancel]);

	return (
		<div className={styles.backdrop} role="presentation">
			<section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="participation-modal-title">
				<button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onCancel} disabled={loading} aria-label="Close confirmation dialog">
					<FiX aria-hidden="true" />
				</button>
				<p className={styles.eyebrow}>Review before entering</p>
				<h2 id="participation-modal-title">Confirm Participation</h2>
				<div className={styles.prize}>
					{prize.image ? <img src={prize.image} alt={`${prize.name} prize`} /> : <FiCheckCircle aria-hidden="true" />}
					<div><strong>{prize.name}</strong><span>{prize.description}</span></div>
				</div>
				<dl className={styles.summary}>
					<div><dt>Entry Fee</dt><dd>{formatAmount(amount, currency)}</dd></div>
					<div><dt>Your Balance</dt><dd>{formatAmount(wallet.balance, wallet.currency)}</dd></div>
					<div><dt>Balance After Joining</dt><dd>{balanceAfter == null ? "Unavailable" : formatAmount(balanceAfter, wallet.currency)}</dd></div>
				</dl>
				<p className={styles.terms}>By continuing, you confirm that you have reviewed the giveaway rules, eligibility, and entry requirement.</p>
				{error && <p className={styles.error} role="alert">{error}</p>}
				<div className={styles.actions}>
					<button className={styles.cancelButton} type="button" onClick={onCancel} disabled={loading}>Cancel</button>
					<button className={styles.confirmButton} type="button" onClick={onConfirm} disabled={loading}>
						{loading ? "Joining..." : "Confirm & Join"}
					</button>
				</div>
			</section>
		</div>
	);
}
