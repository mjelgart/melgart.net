import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../utils/posts';
import Head from 'next/head';
import Date from '../../components/date';
import injectMetadata from '../../components/injectMetadata'
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
  const description = postData.subtitle ?? "Within cells interlinked.";
  return (
    <Layout>
      <Head>
        {injectMetadata(postData.title, description)}
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