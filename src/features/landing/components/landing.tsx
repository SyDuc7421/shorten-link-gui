import { ArrowRight, CalendarClock, Link2, MousePointerClick, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export async function Landing() {
  const t = await getTranslations('home');
  const tLinks = await getTranslations('links');

  const features = [
    {
      key: 'fast',
      icon: Zap,
      title: t('featureFastTitle'),
      description: t('featureFastDescription'),
    },
    {
      key: 'expiry',
      icon: CalendarClock,
      title: t('featureExpiryTitle'),
      description: t('featureExpiryDescription'),
    },
    {
      key: 'clicks',
      icon: MousePointerClick,
      title: t('featureClicksTitle'),
      description: t('featureClicksDescription'),
    },
  ];

  // Sample rows for the static preview. Click counts are illustrative only.
  const previewLinks = [
    { key: 'b', short: t('previewShortB'), long: t('previewLongB'), clicks: 1284 },
    { key: 'c', short: t('previewShortC'), long: t('previewLongC'), clicks: 312 },
  ];

  return (
    <main id="main" className="relative isolate flex w-full flex-1 flex-col">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-160 bg-grid" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-160 bg-glow" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-12 md:px-6 md:py-20">
        <section className="flex flex-col items-center gap-10 text-center">
          <div className="flex max-w-2xl flex-col items-center gap-5">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Zap aria-hidden="true" />
              {t('eyebrow')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              {t.rich('title', {
                highlight: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h1>
            <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              {t('description')}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base shadow-sm">
              <Link href="/register">
                {t('primaryCta')}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link href="/login">{t('secondaryCta')}</Link>
            </Button>
          </div>

          <figure className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border bg-card/80 p-3 text-left shadow-lg ring-1 ring-primary/5 backdrop-blur-sm sm:p-4">
            <figcaption className="sr-only">{t('previewLabel')}</figcaption>

            <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-2 pl-3">
              <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
                {t('previewLong')}
              </p>
              <span
                aria-hidden="true"
                className="hidden shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground sm:inline"
              >
                {tLinks('submit')}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-primary/20 bg-secondary/60 px-3 py-3">
              <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="min-w-0 truncate font-mono text-base font-semibold text-secondary-foreground">
                {t('previewShort')}
              </p>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <p className="px-1 text-xs font-medium text-muted-foreground">{t('previewRecent')}</p>
              <ul className="flex flex-col divide-y rounded-lg border">
                {previewLinks.map(({ key, short, long, clicks }) => (
                  <li key={key} className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-mono text-sm font-medium text-primary">
                        {short}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{long}</span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-foreground tabular-nums">
                      <MousePointerClick
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {tLinks('clicks', { count: clicks })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        </section>

        <section aria-labelledby="features-heading" className="flex flex-col gap-6">
          <h2 id="features-heading" className="sr-only">
            {t('featuresTitle')}
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map(({ key, icon: Icon, title, description }) => (
              <li
                key={key}
                className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-colors duration-(--duration-fast) hover:border-primary/30"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-primary/10">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="flex flex-col items-center gap-6 rounded-xl border bg-card px-6 py-12 text-center shadow-sm"
        >
          <div className="flex max-w-lg flex-col gap-2">
            <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight text-balance">
              {t('ctaTitle')}
            </h2>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">
              {t('ctaDescription')}
            </p>
          </div>
          <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
            <Link href="/register">
              {t('primaryCta')}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
