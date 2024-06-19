import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import s from "@/styles/Home.module.css";
import Terminal from "@/components/Terminal";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Resume website of Wes Jorgensen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={s.main}>
        <Terminal />
      </main>
    </>
  );
}
