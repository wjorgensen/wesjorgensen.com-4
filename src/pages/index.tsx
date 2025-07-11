import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import s from "@/styles/Home.module.scss";
import Terminal from "@/components/Terminal";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Wes Jorgensen",
    "jobTitle": "Computer Science Student & Blockchain Developer",
    "description": "Computer Science student at BU, President of BU Blockchain, and full-stack developer specializing in blockchain technology.",
    "url": "https://wesjorgensen.com",
    "image": "https://wesjorgensen.com/android-chrome-384x384.png",
    "sameAs": [
      "https://x.com/wezabis",
      "https://github.com/wjorgensen"
    ],
    "affiliation": {
      "@type": "Organization",
      "name": "Boston University"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "BU Blockchain",
      "description": "Blockchain organization at Boston University"
    },
    "knowsAbout": [
      "Blockchain Technology",
      "Web Development",
      "Next.js",
      "React",
      "TypeScript",
      "Solidity",
      "Python",
      "Java"
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Boston University"
    }
  };

  return (
    <>
      <Head>
        <title>Wes Jorgensen - Developer & Blockchain Enthusiast</title>
        <meta name="description" content="Personal website of Wes Jorgensen - Computer Science student at BU, President of BU Blockchain, and full-stack developer specializing in blockchain technology." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Wes Jorgensen" />
        <meta name="keywords" content="Wes Jorgensen, developer, blockchain, BU Blockchain, computer science, web development, Next.js" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wesjorgensen.com/" />
        <meta property="og:title" content="Wes Jorgensen - Developer & Blockchain Enthusiast" />
        <meta property="og:description" content="Personal website of Wes Jorgensen - Computer Science student at BU, President of BU Blockchain, and full-stack developer." />
        <meta property="og:image" content="https://wesjorgensen.com/android-chrome-384x384.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://wesjorgensen.com/" />
        <meta property="twitter:title" content="Wes Jorgensen - Developer & Blockchain Enthusiast" />
        <meta property="twitter:description" content="Personal website of Wes Jorgensen - Computer Science student at BU, President of BU Blockchain, and full-stack developer." />
        <meta property="twitter:image" content="https://wesjorgensen.com/android-chrome-384x384.png" />
        <meta property="twitter:creator" content="@Wezabis" />

        {/* Favicons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </Head>
      <main className={s.main}>
        <Terminal />
      </main>
    </>
  );
}
