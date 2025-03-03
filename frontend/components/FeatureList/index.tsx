import styles from './FeatureList.module.css';
import Image from 'next/image';

interface Feature {
    title: string;
    description: string;
    img?: string;
    content?: React.ReactNode
}

interface FeatureListProps {
    features: Feature[];
}

export function FeatureList({ features }: FeatureListProps) {
    return (
        <section className={styles.featureList}>
            {/* <h2 className={styles.sectionTitle}>主な機能</h2> */}
            <div className={styles.features}>
                {features.map((feature, index) => (
                    <div key={index} className={styles.featureCard}>
                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                        <p className={styles.featureDescription}>{feature.description}</p>
                        {feature.img && (
                            <div className={styles.featureImageWrapper}>
                                <Image
                                    id="cafeImage"
                                    src={feature.img}
                                    alt={feature.title}
                                    fill
                                    sizes="(max-width: 768px) 100px, 120px"
                                    className={styles.featureImage}
                                    priority
                                />
                            </div>
                        )}
                        {feature.content && (
                            <div className={`featureContent ${styles.featureContent}`}>
                                {feature.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
} 