import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Story from './components/Story'
import Location from './components/Location'
import Gallery from './components/Gallery'
import Gifts from './components/Gifts'
import RSVP from './components/RSVP'
import Footer from './components/Footer'

export const metadata = {
  title: 'Natascha & Florian - 19. September 2026',
  description: 'Wir heiraten! Save the Date für unsere Hochzeit am Weingut Baron Knyphausen in Eltville.',
}

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Story />
      <Location />
      <Gallery />
      <Gifts />
      <RSVP />
      <Footer />
    </main>
  )
}
