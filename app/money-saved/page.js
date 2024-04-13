import Head from 'next/head';
import Layout, { siteTitle } from '../../components/layout';
import utilStyles from '../../styles/utils.module.css';

function moneyCalculator() {
    const startDate = new Date('2024-04-14');
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const yearsDiff = daysDiff / 365.25;
    const moneySaved = (yearsDiff * 48).toFixed(2);
  
    return (
      <div>
        <p>Money saved: ${moneySaved}</p>
        {moneySaved < 10 && <p>Not a lot so far! But in a few months it'll start to add up.</p>}
      </div>
    );
}

export default function Page() {
    return (
      <Layout>
        <Head>
          <title>"Money Saved"</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>Money Saved</h1>
          <div className={utilStyles.lightText}>
            Placeholder
          </div>
          <section className={`${utilStyles.headingMd}`}>
            <p>This page calculates how much money I've saved by using the free Github Pages site over the former Wordpress hosted site.</p>
            {moneyCalculator()}
        </section>
        </article>
      </Layout>
    );
  }