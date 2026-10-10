import { SiteFooter, SiteHeader } from './site-chrome';
import styles from './prose-page.module.css';

type ProsePageProps = {
  children: React.ReactNode;
  eyebrow: string;
  intro?: React.ReactNode;
  title: string;
};

/** A page of reading: support, privacy. */
export function ProsePage({ children, eyebrow, intro, title }: ProsePageProps) {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <div className={styles.intro}>{intro}</div> : null}
        <div className={styles.body}>{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

export function ProseSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
