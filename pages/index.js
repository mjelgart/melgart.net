import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../utils/posts';
import Link from 'next/link';
import Date from '../components/date';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <h1 className={utilStyles.heading2Xl}>Michael Elgart</h1>
      <section className={utilStyles.headingMd}>
        <p>I’m a software engineer at Meta where I work on the Metrics Platform team. I’ve previously worked at IBM as an automation engineer and consultant. I’ve most often used technologies like React, Node, Kubernetes, and Python.</p>
        <p>Apart from work, I graduated from Duke University in 2014, where I studied both economics and computer science. I live with my family in Memphis, TN where we play too many board games.</p>
        <p>I occasionally write some thoughts which are hosted on the blog here.</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>What I'm Reading</h2>
        <ul className={utilStyles.list}>

          <li className={utilStyles.listItem} key='acx'>
            <Link href='https://www.astralcodexten.com/' target='_blank'>Astral Codex Ten</Link>
          </li>
          <li className={utilStyles.listItem} key='slowboring'>
            <Link href='https://www.slowboring.com/' target='_blank'>Slow Boring</Link>
          </li>
          <li className={utilStyles.listItem} key='stratechery'>
            <Link href='https://stratechery.com/' target='_blank'>Stratechery</Link>
          </li>

          <li className={utilStyles.listItem} key='Postlibertarian'>
            <Link href='https://postlibertarian.com/' target='_blank'>Postlibertarian</Link>
          </li>
          <li className={utilStyles.listItem} key='dontworryaboutthevase'>
            <Link href='https://thezvi.wordpress.com/' target='_blank'>Don't Worry About the Vase</Link>
          </li>
          <li className={utilStyles.listItem} key='gwern'>
            <Link href='https://gwern.net/index' target='_blank'>Gwern</Link>
          </li>
          <li className={utilStyles.listItem} key='margrev'>
            <Link href='https://marginalrevolution.com/' target='_blank'>Marginal Revolution</Link>
          </li>
          <li className={utilStyles.listItem} key='apricitas'>
            <Link href='https://www.apricitas.io/' target='_blank'>Aprecitas Economics</Link>
          </li>


        </ul>
      </section>
    </Layout>
  );
}