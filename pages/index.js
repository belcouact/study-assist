import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Study Assistant</title>
        <meta name="description" content="Study assistant application with various tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Study Assistant</span>
        </h1>

        <p className={styles.description}>
          Choose a tool to get started
        </p>

        <div className={styles.grid}>
          {/* Text to Image Demo Card */}
          <Link href="/text-to-image-demo">
            <div className={styles.card}>
              <h2>Text to Image &rarr;</h2>
              <p>Convert text prompts to images using 豆包 API.</p>
            </div>
          </Link>
          
          {/* Add other tools here */}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by Next.js</p>
      </footer>
    </div>
  );
} 