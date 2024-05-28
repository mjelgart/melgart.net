import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../utils/posts';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}
export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}


export default function Post({ postData }) {
    return (
      <Layout>
        <Head>
          <title>{postData.title}</title>
          <meta
            name="description"
            content="Michael's blog."
          />
          <meta name="og:title" content={postData.title} />

          {/* facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={postData.title} />
          <meta property="og:description" content="" />

          {/* twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="melgart.net" />
          <meta name="twitter:title" content={postData.title}/>
          <meta name="twitter:description" content="Michael's blog" />
            
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }