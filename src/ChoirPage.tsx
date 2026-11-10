import { site, type Concert } from "@/content/site";
import { ActionLink, Brand, Panel } from "@/components/site/parts";
import { Icon } from "@/components/site/Icon";
import { useSiteContent } from "@/content/context";

const dateFmt = new Intl.DateTimeFormat(site.locale, { timeZone: "Europe/Stockholm", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ChoirPage() {
  const site = useSiteContent();
  const { hero, about, concerts, openRehearsal, audition, contact } = site;
  const hasContact = Boolean(contact.email || contact.instagramUrl);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2">
        Hoppa till innehållet
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href={`#${hero.id}`} aria-label={`${site.brand.name}, till toppen`}><Brand /></a>
          <nav aria-label="Huvudmeny">
            <ul className="flex gap-1 sm:gap-4">
              {site.navigation.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="rounded-md px-3 py-2 text-sm font-semibold underline-offset-8 hover:text-accent hover:underline">{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero — swap the photo via hero.image in site-content.json */}
        <section id={hero.id} className="relative overflow-hidden bg-primary text-primary-foreground md:flex md:min-h-[34rem] md:items-center">
          <img
            src={hero.image}
            alt={hero.imageAlt}
            width={2400}
            height={750}
            fetchPriority="high"
            className="block aspect-[2/1] w-full object-cover object-[65%_center] md:absolute md:inset-0 md:h-full md:aspect-auto md:object-[72%_center]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[2/1] bg-gradient-to-t from-primary via-primary/20 to-transparent md:inset-0 md:aspect-auto md:bg-gradient-to-r md:from-primary/85 md:via-primary/35" />
          <div className="relative mx-auto -mt-10 w-full max-w-6xl px-5 pb-7 md:mt-0 md:py-20">
            <h1 className="text-4xl leading-none sm:text-5xl md:text-7xl">{hero.title}</h1>
            <p className="mt-1 font-serif text-4xl italic leading-tight text-hero-blue sm:text-5xl md:text-6xl">{hero.secondaryTitle}</p>
            <span aria-hidden className="mt-4 block h-px w-24 bg-primary-foreground/70" />
            <p className="mt-3 font-serif text-xl italic sm:text-2xl">{hero.subtitle}</p>
          </div>
          {hero.imageIsConcept && <p className="relative px-5 pb-3 text-xs text-primary-foreground/80 md:absolute md:bottom-0 md:right-0">Illustrativ konceptbild</p>}
        </section>

        <section id={about.id} aria-labelledby="om-t">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 sm:py-24 md:grid-cols-[1fr_15rem]">
            <div>
              <h2 id="om-t" className="text-5xl italic sm:text-6xl">{about.title}</h2>
              <span aria-hidden className="mt-4 block h-0.5 w-14 bg-accent" />
              <p className="mt-6 max-w-2xl whitespace-pre-line text-lg">{about.text}</p>
            </div>
            <img src="/assets/images/forget-me-not-sprig.png" alt="" aria-hidden loading="lazy" width={1086} height={1448}
              className="hidden w-60 justify-self-end md:block" />
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:gap-6 sm:pb-24">
          <Panel id={openRehearsal.id} title={openRehearsal.title} tone="deep" art={
            <img src="/assets/images/concert-forgetmenots.webp" alt="" aria-hidden loading="lazy" width={2000} height={500}
              className="pointer-events-none relative block h-28 w-full object-cover object-right [mask-image:linear-gradient(to_bottom,black_60%,transparent)] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2 lg:[mask-image:linear-gradient(to_right,transparent,black_70%)]" />
          }>
            <p className="opacity-90">{openRehearsal.text}</p>
            <ActionLink href={openRehearsal.cta.href} variant="light">{openRehearsal.cta.label}</ActionLink>
          </Panel>

          <Panel id={audition.id} title={audition.title} tone="spotlight" art={
            <img src="/assets/illustrations/line-art-floral-corner.svg" alt="" aria-hidden loading="lazy" width={380} height={400}
              className="absolute right-10 top-1/2 hidden w-48 -translate-y-1/2 opacity-30 lg:block" />
          }>
            <p>{audition.text}</p>
            <ActionLink href={audition.bookingUrl ?? audition.cta.href} variant="light">{audition.cta.label}</ActionLink>
          </Panel>

          <Panel id={concerts.id} title={concerts.title}>
            {concerts.items.length === 0 ? (
              <p className="text-muted-foreground">{concerts.emptyState}</p>
            ) : (
              <ul className="space-y-5">{concerts.items.map((c) => <ConcertItem key={c.date + c.title} c={c} />)}</ul>
            )}
          </Panel>
        </div>
      </main>

      <footer id={contact.id} aria-labelledby="kontakt-t" className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
          <Brand size="lg" />
          <div className="md:border-l md:border-border md:pl-16">
            <h2 id="kontakt-t" className="text-4xl italic">{contact.title}</h2>
            <p className="mt-2 max-w-lg">{contact.intro}</p>
            {hasContact ? (
              <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {contact.email && (
                  <li><a className="inline-flex items-center gap-2 hover:underline" href={`mailto:${contact.email}`}><Icon name="envelope" className="size-5" />{contact.email}</a></li>
                )}
                {contact.instagramUrl && (
                  <li><a className="inline-flex items-center gap-2 hover:underline" href={contact.instagramUrl} target="_blank" rel="noopener noreferrer"><Icon name="instagram" className="size-5" />Instagram</a></li>
                )}
              </ul>
            ) : (
              <p className="mt-5 italic text-muted-foreground">{contact.emptyState}</p>
            )}
            {contact.demoNotice && <p className="mt-5 max-w-lg text-xs text-muted-foreground">{contact.demoNotice}</p>}
          </div>
        </div>
        <p className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {site.brand.name}</p>
      </footer>
    </>
  );
}

function ConcertItem({ c }: { c: Concert }) {
  const site = useSiteContent();
  return (
    <li>
      <h3 className="text-2xl">{c.title}</h3>
      <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 opacity-90">
        <span className="inline-flex items-center gap-2"><Icon name="calendar" className="size-4" /><time dateTime={c.date}>{dateFmt.format(new Date(c.date))}</time></span>
        <span className="inline-flex items-center gap-2"><Icon name="location" className="size-4" />{c.venue}</span>
      </p>
      {c.description && <p className="mt-2 opacity-90">{c.description}</p>}
      {c.ticketUrl && <div className="mt-3"><ActionLink href={c.ticketUrl} variant="light">Biljetter</ActionLink></div>}
      {c.eventUrl && <div className="mt-3"><ActionLink href={c.eventUrl}>{site.concerts.eventLabel}</ActionLink></div>}
    </li>
  );
}
