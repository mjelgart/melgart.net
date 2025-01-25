import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import injectMetadata from '../components/injectMetadata'

const title = "Michael's Sports Teams";
const description = "Tracking team success during my life."

export default function Page() {
    return (
      <Layout>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content={description}
          />
          <meta name="og:title" content={title} />

          {/* facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content="" />

          {/* twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="melgart.net" />
          <meta name="twitter:title" content={title}/>
          <meta name="twitter:description" content={description} />
          {injectMetadata(title, description)}
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{title}</h1>
          <section>
            <p>This page tracks my various sports teams' performance over time</p>
            <p>If you'd like to set up your own site on Github Pages, I made a post documenting what I did <Link href='/posts/self-hosted-blog' target='_blank'>here</Link>.</p>
        </section>
        </article>
      </Layout>
    );
  }