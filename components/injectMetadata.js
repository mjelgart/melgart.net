import Head from 'next/head';

export default function injectMetadata(title, description) {
    return (
    <>
        <title>{title}</title>
        <meta
            name="description"
            content={description}
        />
        <meta name="og:title" content={title} />

        {/* facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        {/* twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="melgart.net" />
        <meta name="twitter:title" content={title}/>
        <meta name="twitter:description" content={description} />
    </>
    );
}

