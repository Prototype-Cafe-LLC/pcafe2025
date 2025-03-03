'use client';

import styles from './page.module.css';
import { Hero } from '@/components/Hero';
import { FeatureList } from '@/components/FeatureList';
import { useEffect, useRef } from 'react';

export default function Home() {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.playbackRate = 0.5;
            ref.current.defaultPlaybackRate = 0.5;
            ref.current.pause();
        }
    }, []);

    const handleMouseEnter = () => {
        console.debug('## onMouseEnter');
        if (ref.current) {
            ref.current.play();
        }
    };

    const handleMouseLeave = () => {
        console.debug('## onMouseLeave');
        if (ref.current) {
            ref.current.pause();
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.videoBackground}>
                <video
                    ref={ref}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.backgroundVideo}
                    // style={{ filter: 'brightness(0.7)' }}
                    preload="auto"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <source src="/TranquilSkySerenity.mp4" type="video/mp4" />
                </video>
            </div>
            <div className={styles.content}>
                <Hero
                    title="Prototype Cafe"
                    subtitle="IoT Consulting & SES"
                // ctaText="詳細を見る"
                />
                <FeatureList
                    features={[
                        {
                            title: 'IoT Consulting & SES',
                            description: '基板・クラウド開発からWebアプリケーションまで対応',
                            icon: '📝'
                        },
                        {
                            title: '技術コミュニティ用オープンスペース',
                            description: 'ローカルの技術コミュニティ用の場所としてご利用になれます',
                            icon: '⚛️',
                            img: '/IMG_1045.jpeg'
                        },
                    ]}
                />
            </div>
        </main>
    );
} 