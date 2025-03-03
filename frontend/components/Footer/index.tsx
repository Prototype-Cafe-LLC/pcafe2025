import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLogo}>
                    <Link href="/">
                        <div className={styles.logoContainer}>
                            <Image
                                src="/logo.png"
                                alt="Prototype Cafe Logo"
                                fill
                                sizes="(max-width: 768px) 100px, 120px"
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                    </Link>
                    <p className={styles.copyright}>
                        © {currentYear} Prototype Cafe, LLC. All rights reserved.
                    </p>
                </div>

                <div className={styles.footerLinks}>
                    <div className={styles.linkGroup}>
                        <h3>サイトマップ</h3>
                        <ul>
                            <li><Link href="/">ホーム</Link></li>
                            <li><Link href="/about">私たちについて</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linkGroup}>
                        <h3>お問い合わせ</h3>
                        <ul>
                            <li><a href="mailto:info@pcafe2025.example.com">メール</a></li>
                            <li><a href="tel:+81-3-1234-5678">電話: 03-1234-5678</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
} 