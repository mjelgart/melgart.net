import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../utils/posts';
import Link from 'next/link';
import Date from '../components/date';
import injectMetadata from '../components/injectMetadata';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

const description = "Michael's blog."

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        {injectMetadata(siteTitle, description)}
      </Head>
      <div className={utilStyles.column}>
      <h1 className={utilStyles.headingXl}>Michael Elgart</h1>
      <section className={`${utilStyles.headingMd}`}>
        <p>I’m a software engineer, dad, and blogger. I grew up in Miami, graduated from Duke in North Carolina, and now live with my family in Washington, DC.</p>
        <p>I like discussing prediction markets, AI risk, governance incentives, and basketball. I occasionally write down some of those thoughts which are hosted on the blog here. </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
        <h2 className={utilStyles.headingLg}>My Links</h2>
        <b>
        Professional: <Link href='https://www.linkedin.com/in/michaelelgart/' target='_blank'>LinkedIn</Link> 
        <br />
        Coding: 
        <Link href='https://github.com/mjelgart' target='_blank'>GitHub</Link> {"\t"}
        <br/>
        Fun: 
        <Link href='https://www.threads.net/@mjelgart' target='_blank'>Threads</Link> {"\t"}
        <Link href='https://letterboxd.com/3Fast3Furious/' target='_blank'>Letterboxd</Link> </b>
      </section>
      <section className={` ${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.slice(0,5).map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
          <li><Link href='/posts'> ➡️All Posts</Link></li>
        </ul>
      </section>
      <section className={`${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
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
          <li className={utilStyles.listItem} key='constructionphysics'>
            <Link href='https://www.construction-physics.com/' target='_blank'>Construction Physics</Link>
          </li>
          <li className={utilStyles.listItem} key='margrev'>
            <Link href='https://marginalrevolution.com/' target='_blank'>Marginal Revolution</Link>
          </li>
          <li className={utilStyles.listItem} key='betonit'>
            <Link href='https://www.betonit.ai/' target='_blank'>Bet On It</Link>
          </li>
        </ul>
      </section>
      <section className={`${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
        <h2 className={utilStyles.headingLg}>What I'm Listening To</h2>
        <ul className={utilStyles.list}>

          <li className={utilStyles.listItem} key='dwarkesh'>
            <Link href='https://www.dwarkesh.com/' target='_blank'>Dwarkesh</Link>
          </li>
          <li className={utilStyles.listItem} key='complexsystemsc'>
            <Link href='https://www.complexsystemspodcast.com/' target='_blank'>Complex Systems</Link>
          </li>
          <li className={utilStyles.listItem} key='reasonroundtable'>
            <Link href='https://reason.com/podcasts/the-reason-roundtable/' target='_blank'>Reason Roundtable</Link>
          </li>
          <li className={utilStyles.listItem} key='thefifthcolumn'>
            <Link href='https://www.wethefifth.com/' target='_blank'>The Fifth Column</Link>
          </li>
          <li className={utilStyles.listItem} key='econtalk'>
            <Link href='https://www.econlib.org/econtalk/' target='_blank'>EconTalk</Link>
          </li>
          <li className={utilStyles.listItem} key='80000hours'>
            <Link href='https://80000hours.org/podcast//' target='_blank'>80,000 Hours</Link>
          </li>
          
        </ul>
      </section>
      <section className={`${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
      <h2 className={utilStyles.headingLg}>Extras</h2>
      <ul className={utilStyles.list}>
      <li className={utilStyles.listItem} key='sports'>
          <Link href='/sports' >Sports</Link>
        </li>
        <li className={utilStyles.listItem} key='hosting-saved'>
          <Link href='/saved-on-hosting' >Money Saved Self Hosting</Link>
        </li>

      </ul>
      </section>
      <br />
      <p>Material on this site created by Michael Elgart is licensed under 
        <Link href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer"> CC BY 4.0</Link>.
      </p>
      </div>
    </Layout>
  );
}