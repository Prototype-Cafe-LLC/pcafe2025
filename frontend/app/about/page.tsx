import styles from './about.module.css';

export const metadata = {
    title: 'About Us',
    description: 'About Us',
};

export default function AboutPage() {
    return (
        <div className={styles.about}>
            <h1 className={styles.title}>About Us</h1>

            <section className={styles.section}>
                <h2>Our Mission</h2>
                <p>
                    PCafe 2025は、最新のウェブ技術を活用して、ユーザーに最高のエクスペリエンスを提供することを目指しています。
                    Next.js、React、TypeScriptを組み合わせることで、高速で安全、そして使いやすいアプリケーションを構築しています。
                </p>
            </section>

            <section className={styles.section}>
                <h2>Technology Stack</h2>
                <ul className={styles.techList}>
                    <li>Next.js (App Router)</li>
                    <li>React</li>
                    <li>TypeScript</li>
                    <li>CSS Modules</li>
                    <li>Bun</li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>Our Team</h2>
                <p>
                    私たちは、フロントエンド開発に情熱を持つエンジニアのチームです。
                    ユーザー体験を向上させるための新しいアイデアを常に探求しています。
                    また、Bunのような最新のJavaScriptランタイムを活用して、開発効率と実行速度の向上にも取り組んでいます。
                </p>
            </section>
        </div>
    );
} 