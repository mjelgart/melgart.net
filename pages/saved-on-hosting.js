import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import injectMetadata from '../components/injectMetadata'

function moneyCalculator() {
    const startDate = new Date('2024-04-14');
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const yearsDiff = daysDiff / 365.25;
    const moneySaved = (yearsDiff * 48).toFixed(2);
  
    return (
      <div>
        <p className={`${utilStyles.headingLg}`}>Money saved on cloud hosting: ${moneySaved}</p>
        {moneySaved < 10 && <p>Not a lot so far! But in a few months it'll start to add up.</p>}
      </div>
    );
}

const title = "Money Saved";
const description = "Raking in the Benjamins."

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
            <p>This page calculates how much money I've saved by using the free Github Pages site over the former Wordpress hosted site.</p>
            {moneyCalculator()}
        </section>
        </article>
      </Layout>
    );
  }