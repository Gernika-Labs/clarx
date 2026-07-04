import styles from './landing.module.css'
import { Nav, HeroSection } from './landing-hero'
import { ProblemSection, PillarsSection } from './landing-standard'
import { CliSection, ManifestSection } from './landing-tools'
import { AdoptionSection, ManifestoSection, FooterCtaSection, Footer } from './landing-footer'

export default function HomePage() {
  return (
    <div className={styles.root}>
      <Nav />
      <HeroSection />
      <ProblemSection />
      <PillarsSection />
      <CliSection />
      <ManifestSection />
      <AdoptionSection />
      <ManifestoSection />
      <FooterCtaSection />
      <Footer />
    </div>
  )
}
