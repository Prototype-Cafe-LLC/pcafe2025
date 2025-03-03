'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

interface NavItem {
    label: string;
    path: string;
}

interface NavigationProps {
    items?: NavItem[];
}

export function Navigation({ items = [] }: NavigationProps) {
    const pathname = usePathname();

    const defaultItems: NavItem[] = [
        { label: 'Home', path: '/' },
        { label: 'カフェの今', path: 'https://www.prototype-cafe.space/%E3%82%AB%E3%83%95%E3%82%A7%E3%81%AE%E4%BB%8A/' }, //'/カフェの今' },
        { label: 'オープンスペース', path: 'https://www.prototype-cafe.space/%E5%88%A9%E7%94%A8%E3%81%AE%E3%81%94%E6%A1%88%E5%86%85/' }, //'/オープンスペース' },
        { label: '地域イベント', path: 'https://www.prototype-cafe.space/event/' }, // '/event' },
        { label: 'About Us', path: 'https://www.prototype-cafe.space/prototype-cafe-llc/' }, // '/prototype-cafe-llc' },
    ];

    const navItems = items.length > 0 ? items : defaultItems;

    return (
        <nav className={styles.navigation}>
            <div className={styles.logo}>
                <Link href="/">
                    <div className={styles.logoContainer}>
                        <Image
                            src="/logo.png"
                            alt="Prototype Cafe Logo"
                            fill
                            sizes="(max-width: 768px) 120px, 50px"
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </Link>
            </div>
            <ul className={styles.navItems}>
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            href={item.path}
                            className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
} 