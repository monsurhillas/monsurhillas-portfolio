import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Research from "@/components/Research";
import Awards from "@/components/Awards";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/get-content";

export default async function Home() {
  const content = await getContent();
  const { profile } = content;

  return (
    <>
      <Nav name={profile.name} resumeUrl={profile.resume_url} />
      <main className="flex-1">
        <Hero profile={profile} />
        <Experience items={content.experience} />
        <Education items={content.education} />
        <Skills groups={content.skills} />
        <Projects items={content.projects} />
        <Research items={content.research} />
        <Awards items={content.awards} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
    </>
  );
}
