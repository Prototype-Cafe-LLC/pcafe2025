'use client';

import styles from './page.module.css';
import { Hero } from '@/components/Hero';
import { FeatureList } from '@/components/FeatureList';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Box, Flex, Link } from "@radix-ui/themes";

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
                    subtitle="@PrototypeCafe"
                // ctaText="詳細を見る"
                />
                <FeatureList
                    features={[
                        {
                            title: 'IoT Consulting & SES',
                            description: '基板・クラウド構成からWebアプリケーションまで対応',
                            content: <Flex direction="column" gap="2" className={styles.skillSection}>
                                主に利用している技術スタック
                                <Flex direction="row" gap="2" style={{ marginTop: "0.5em", marginBottom: "0.5em", fontSize: "0.8em" }}>
                                    要件定義・アーキテクチャ選定・設計〜デプロイ
                                </Flex>
                                <Flex direction="row" gap="2">
                                    <Image src="/linux.png" alt="Linux" width={32} height={32} />
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Box style={{ display: "inline-block", width: 32, height: 32, fontSize: 24, fontWeight: "bold", position: "relative" }}>C</Box>
                                    <Link href="https://www.rust-lang.org/" target="_blank">
                                        <Image src="/rust-logo-64x64.png" alt="Rust" width={32} height={32} />
                                    </Link>
                                    <Link href="https://go.dev/" target="_blank">
                                        <Image src="/Golang.png" alt="Golang" width={64} height={32} />
                                    </Link>
                                    <Link href="https://www.typescriptlang.org/" target="_blank">
                                        <Image src="/typescript.png" alt="TypeScript" width={48} height={32} />
                                    </Link>
                                    <Link href="https://www.python.org/" target="_blank">
                                        <Image src="/python.png" alt="Python" width={128} height={32} />
                                    </Link>
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Link href="https://github.com/" target="_blank">
                                        <Image src="/github.png" alt="GitHub" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.docker.com/" target="_blank">
                                        <Image src="/docker.jpeg" alt="Docker" width={32} height={32} />
                                    </Link>
                                    <Link href="https://aws.amazon.com/" target="_blank">
                                        <Image src="/aws.jpeg" alt="AWS" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.sakura.ad.jp/" target="_blank">
                                        <Image src="/sakura.png" alt="さくらインターネット" width={128} height={18} />
                                    </Link>
                                    <Link href="https://www.ansible.com/" target="_blank">
                                        <Image src="/ansible.jpeg" alt="Ansible" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.terraform.io/" target="_blank">
                                        <Image src="/terraform.jpeg" alt="Terraform" width={64} height={32} />
                                    </Link>
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Link href="https://react.dev/" target="_blank">
                                        <Image src="/react_light.svg" alt="React" width={32} height={32} />
                                    </Link>
                                    <Link href="https://nextjs.org/" target="_blank">
                                        <Image src="/nextjs.svg" alt="Next.js" width={32} height={32} />
                                    </Link>
                                    <Link href="https://redux.js.org/" target="_blank">
                                        <Image src="/redux.svg" alt="Redux" width={32} height={32} />
                                    </Link>
                                    <Link href="https://redux-saga.js.org/" target="_blank">
                                        <Image src="/Redux-Saga-Logo.png" alt="Redux Saga" width={48} height={24} />
                                    </Link>
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Link href="https://fastapi.tiangolo.com/" target="_blank">
                                        <Image src="/fastApi.png" alt="FastAPI" width={96} height={32} />
                                    </Link>
                                    <Link href="https://www.djangoproject.com/" target="_blank">
                                        <Image src="/django.png" alt="Django" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.django-rest-framework.org/" target="_blank">
                                        <Image src="/drf.png" alt="Django Rest Framework" width={64} height={32} />
                                    </Link>
                                    <Link href="https://www.postgresql.org/" target="_blank">
                                        <Image src="/postgresql.png" alt="PostgreSQL" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.mysql.com/" target="_blank">
                                        <Image src="/mysql.png" alt="MySQL" width={32} height={32} />
                                    </Link>
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Link href="https://pandas.pydata.org/" target="_blank">
                                        <Image src="/pandas.png" alt="Pandas" width={64} height={64} />
                                    </Link>
                                    <Link href="https://matplotlib.org/" target="_blank">
                                        <Image src="/matplotlib.png" alt="Matplotlib" width={146} height={48} />
                                    </Link>
                                    <Link href="https://d3js.org/" target="_blank">
                                        <Image src="/d3js.svg" alt="D3.js" width={32} height={32} />
                                    </Link>
                                </Flex>
                                <Flex className={styles.skillSubSection}>
                                    <Link href="https://www.uml.org/" target="_blank">
                                        <Image src="/uml.png" alt="UML" width={64} height={32} />
                                    </Link>
                                    <Link href="https://sparxsystems.com/products/ea/" target="_blank">
                                        <Image src="/enterprisearchitect.png" alt="Enterprise Architect" width={32} height={32} />
                                    </Link>
                                    <Link href="https://www.openapis.org/" target="_blank">
                                        <Image src="/openapi.png" alt="OpenAPI" width={96} height={32} />
                                    </Link>
                                </Flex>
                                <Flex direction="row" gap="2" style={{ paddingLeft: "2em", marginTop: "0.5em", marginBottom: "0.5em", fontSize: "0.8em" }}>
                                    <ul>
                                        <li>回路設計
                                            <Link href="https://www.kicad.org/" target="_blank">
                                                <Image src="/kicad.png" alt="KiCad" width={64} height={32} style={{ position: "relative", top: 6 }} />
                                            </Link>
                                        </li>
                                        <li>ARM/CMSIS</li>
                                        <li>RTOS</li>
                                        <li>USB/UART/I2C/SPI/Ethernet/Wifi/BLE</li>
                                        <li>ST Micro</li>
                                        <li>NXP</li>
                                        <li>Renesus</li>
                                        <li>BlueTooth / Nordic Semiconductor</li>
                                        <li>ESP32...</li>
                                        <li>Raspberry Pi</li>
                                        <li>産業用機器インターフェース</li>
                                    </ul>
                                </Flex>
                            </Flex>
                        },
                        {
                            title: '技術コミュニティ用オープンスペース',
                            description: '技術コミュニティの会開催などにご利用になれます',
                            img: '/IMG_1045.jpeg'
                        },
                    ]}
                />
            </div >
        </main >
    );
} 