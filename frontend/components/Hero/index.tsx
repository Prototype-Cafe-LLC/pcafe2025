import styles from './Hero.module.css';

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText?: string;
    onCtaClick?: () => void;
}

export function Hero({ title, subtitle, ctaText, onCtaClick }: HeroProps) {
    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {ctaText && (
                <button
                    className={styles.ctaButton}
                    onClick={onCtaClick}
                >
                    {ctaText}
                </button>
            )}
        </section>
    );
} 