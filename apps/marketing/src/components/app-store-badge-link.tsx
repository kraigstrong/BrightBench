import Image from 'next/image';

type AppStoreBadgeLinkProps = {
  href: string;
  label?: string;
};

const APP_STORE_BADGE_SRC =
  'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';

export function AppStoreBadgeLink({
  href,
  label = 'Download on the App Store',
}: AppStoreBadgeLinkProps) {
  return (
    <a
      aria-label={label}
      href={href}
      rel="noreferrer"
      style={{ display: 'inline-flex', lineHeight: 0 }}
      target="_blank">
      <Image
        alt={label}
        height={40}
        src={APP_STORE_BADGE_SRC}
        unoptimized
        width={160}
      />
    </a>
  );
}

