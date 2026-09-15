import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FAQ_DATA } from "../../data/faqData.js";
import styles from "./FAQ.module.css";

export default function FAQ() {
	const [openId, setOpenId] = useState(null);

	const toggleQuestion = (id) => {
		setOpenId((currentId) => (currentId === id ? null : id));
	};

	return (
		<section className={styles.section} aria-labelledby="faq-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Need to know</p>
					<h2 id="faq-title">Frequently Asked Questions</h2>
					<p>Find clear answers about participating in a VELOOP giveaway.</p>
				</div>

				<div className={styles.list}>
					{FAQ_DATA.map(({ id, question, answer }) => {
						const isOpen = openId === id;
						const panelId = `${id.toLowerCase()}-answer`;

						return (
							<div className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`} key={id}>
								<h3 className={styles.questionHeading}>
									<button
										className={styles.question}
										type="button"
										aria-expanded={isOpen}
										aria-controls={panelId}
										onClick={() => toggleQuestion(id)}
									>
										<span>{question}</span>
										<FiChevronDown className={styles.icon} aria-hidden="true" />
									</button>
								</h3>
								<div className={styles.answerWrapper} id={panelId} hidden={!isOpen}>
									<p className={styles.answer}>{answer}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
