import { Injectable } from '@nestjs/common';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { DateTime } from 'luxon';
import { Crawler, CrawledProgram } from '../crawler/crawler.interface';
import {
  Web3SecurityContest,
  Web3SecurityContestStatus,
} from '../schemas/web3-security-contest.schema';

@Injectable()
export class CodeHawksCrawlerService implements Crawler {
  name: string = 'CodeHawks';

  async crawl(): Promise<CrawledProgram[]> {
    const pLimit = (await import('p-limit')).default;
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();
    await page.goto('https://codehawks.cyfrin.io/contests?contestType=al', {
      waitUntil: 'domcontentloaded',
    });
    const dom: JSDOM = new JSDOM(await page.content());
    const items: NodeListOf<Element> =
      dom.window.document.querySelectorAll('li > div > div');
    const results: CrawledProgram[] = [];
    const limit = pLimit(10);
    const parsePromises: Array<Promise<CrawledProgram | null>> = [];

    for (const el of items) {
      const link: HTMLAnchorElement | null = el.querySelector(
        'a[href*="/c/"]',
      ) as HTMLAnchorElement;
      if (!link) {
        continue;
      }
      const contestUrl: string = `https://codehawks.cyfrin.io${link.href}`;
      parsePromises.push(
        limit(async () => {
          try {
            const data: CrawledProgram | null = await this.parseContest(
              contestUrl,
              browser,
            );
            return data;
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error(
                `Помилка парсингу контесту ${contestUrl}:`,
                err.message,
              );
            }
            return null;
          }
        }),
      );
    }

    const parsed: Array<CrawledProgram | null> =
      await Promise.all(parsePromises);
    for (const data of parsed) {
      if (data) {
        results.push(data);
      }
    }

    await browser.close();
    return results;
  }

  private async parseContest(
    url: string,
    browser: Browser,
  ): Promise<CrawledProgram | null> {
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const html: string = await page.content();
    const dom: JSDOM = new JSDOM(html);
    const h1: string =
      dom.window.document.querySelector('h1')?.textContent?.trim() ?? '';
    const sponsorName: string =
      dom.window.document
        .querySelector('div.text-base.font-normal.text-gray-600')
        ?.textContent?.trim() ?? '';
    const imageUrl: string =
      dom.window.document
        .querySelector('img[data-melt-avatar-image]')
        ?.getAttribute('src') ?? '';
    const repoLink: string =
      dom.window.document
        .querySelector('a[href*="github.com"]')
        ?.getAttribute('href') ?? '';
    const languages: string[] = repoLink
      ? await this.fetchGitHubRepoLanguages(repoLink)
      : [];
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    try {
      const dateElements = await page.$$(
        'div.cursor-default.text-sm.font-normal.text-gray-600',
      );

      for (const de of dateElements) {
        // Перевірка тексту без тултипу
        const dateText = await de.textContent();

        if (dateText && dateText.includes('→')) {
          // Якщо текст є, парсимо дати без тултипу
          const [rawFrom, rawTo]: string[] = dateText
            .split('→')
            .map((t) => t.trim());
          startDate = this.parseTooltipDate(rawFrom);
          endDate = this.parseTooltipDate(rawTo);
          break;
        }

        // Якщо тексту немає, шукаємо тултип
        await de.hover();
        const tooltipLocator = page.locator('div[role="tooltip"]');

        // Очікуємо, поки тултип стане видимим
        await tooltipLocator.waitFor({ state: 'visible', timeout: 3000 });

        // Отримуємо текст тултипу
        const tooltipText: string = (await tooltipLocator.innerText()).trim();

        if (tooltipText.includes('→')) {
          const [rawFrom, rawTo]: string[] = tooltipText
            .split('→')
            .map((t) => t.trim());
          startDate = this.parseTooltipDate(rawFrom);
          endDate = this.parseTooltipDate(rawTo);
          break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(
          `Не вдалося прочитати тултип із дат на ${url}`,
          err.message,
        );
      }
    }

    await context.close();

    if (!startDate || !endDate) {
      throw new Error('Не вдалося визначити дати');
    }

    return {
      program: `${sponsorName} / ${h1}`,
      slug: this.extractSlug(url),
      platform: 'CodeHawks',
      imageUrl,
      originalUrl: url,
      languages,
      maxReward: 0,
      rewardsPool: 0,
      rewardsToken: '',
      startDate,
      endDate,
      evaluationEndDate: endDate,
      status: this.determineStatus(startDate, endDate),
      tags: [],
    } as Web3SecurityContest;
  }

  private parseTooltipDate(raw: string): Date {
    let cleaned: string = raw.replace(/[()]/g, '');
    cleaned = cleaned.replace(/\b(\d+)(st|nd|rd|th)\b/, '$1');
    cleaned = cleaned.replace(/(\d+),\s+(\d+)/, '$1 $2');
    cleaned = cleaned.replace(/GMT\+(\d+)/, '+0$1:00');

    // Основний формат
    const primaryFormat = 'ccc, LLL d yyyy HH:mm ZZ';
    const secondaryFormats = [
      'LLL d yyyy', // Наприклад, "Apr 22 2024"
      'MMM d yyyy', // Наприклад, "Sep 30 2024"
    ];

    // Спробуємо спочатку основний формат
    let dt: DateTime = DateTime.fromFormat(cleaned, primaryFormat, {
      zone: 'utc',
    });

    // Якщо основний формат не спрацював, пробуємо додаткові
    if (!dt.isValid) {
      for (const format of secondaryFormats) {
        dt = DateTime.fromFormat(cleaned, format, { zone: 'utc' });
        if (dt.isValid) {
          break;
        }
      }
    }

    // Якщо дата все одно недійсна, кидаємо помилку
    if (!dt.isValid) {
      throw new Error(
        `Luxon parse failed for date string: "${raw}" => cleaned: "${cleaned}"`,
      );
    }

    return dt.toJSDate();
  }

  private extractSlug(url: string): string {
    const idx: number = url.lastIndexOf('/');
    return idx < 0 ? url : url.slice(idx + 1);
  }

  private determineStatus(from: Date, to: Date): Web3SecurityContestStatus {
    const now: number = Date.now();
    if (to.getTime() < now) {
      return Web3SecurityContestStatus.FINISHED;
    }
    if (from.getTime() > now) {
      return Web3SecurityContestStatus.UPCOMING;
    }
    return Web3SecurityContestStatus.ONGOING;
  }

  private async fetchGitHubRepoLanguages(repoUrl: string): Promise<string[]> {
    const match: RegExpMatchArray | null = /github\.com\/([^/]+)\/([^/]+)/.exec(
      repoUrl,
    );
    if (!match) {
      return [];
    }
    const owner: string = match[1];
    const repo: string = match[2];
    const res: Response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
    );
    if (!res.ok) {
      return [];
    }
    const data: Record<string, number> = await res.json();
    return Object.keys(data);
  }
}
