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

export default function allPosts({ allPostsData }) {
    return (
      <Layout>
        <Head>
          <title>Blog Archive</title>
        </Head>
        <section className={` ${utilStyles.padding1px} ${utilStyles.marginBottom16px}`}>
            <h2 className={utilStyles.headingLg}>All Posts</h2>
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
      </Layout>
    );
  }

