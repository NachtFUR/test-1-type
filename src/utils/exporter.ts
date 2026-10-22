import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Header, Footer, PageNumber } from 'docx';
import { Manuscript } from '../types/manuscript';

export interface ExportPDFOptions {
  includeCoverPage?: boolean;
  parchmentTone?: boolean;
  customTitle?: string;
  customAuthor?: string;
  customSubtitle?: string;
  customLocationEra?: string;
  coverCategory?: string; // e.g. "AN ORIGINAL MANUSCRIPT", "CONFIDENTIAL DOSSIER", etc.
  coverSealNote?: string; // e.g. "TRANSCRIBED ON REMINGTON TYPEWRITER No. 2 • PRINTED IN THE CITY OF LONDON"
  runningHeaderLeft?: string; // Left header on each page
  runningHeaderRight?: string; // Right header on each page (e.g. place/era or author)
}

/**
 * Generates an authentic Victorian manuscript PDF with customizable headers and places.
 */
export async function exportToPDF(manuscript: Manuscript, options: ExportPDFOptions = {}): Promise<void> {
  const {
    includeCoverPage = true,
    parchmentTone = true,
    customTitle,
    customAuthor,
    customSubtitle,
    customLocationEra,
    coverCategory = 'AN ORIGINAL MANUSCRIPT',
    coverSealNote = 'TRANSCRIBED ON REMINGTON TYPEWRITER No. 2 • PRINTED IN THE CITY OF LONDON',
    runningHeaderLeft,
    runningHeaderRight,
  } = options;

  const title = (customTitle ?? manuscript.title).trim() || 'UNTITLED FOLIO';
  const author = (customAuthor ?? manuscript.author).trim() || 'An Anonymous Writer';
  const subtitle = (customSubtitle ?? manuscript.subtitle)?.trim();
  const locationEra = (customLocationEra ?? manuscript.locationEra)?.trim();

  // Left header defaults to title; Right header defaults to location/era or author
  const headerLeftText = (runningHeaderLeft !== undefined && runningHeaderLeft.trim() !== '')
    ? runningHeaderLeft.trim()
    : title.toUpperCase();
  const headerRightText = (runningHeaderRight !== undefined && runningHeaderRight.trim() !== '')
    ? runningHeaderRight.trim()
    : (locationEra ? locationEra.toUpperCase() : author.toUpperCase());

  // Letter size: 215.9 x 279.4 mm
  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4; // 1 inch
  const contentWidth = pageWidth - margin * 2;

  // Background tint for vintage parchment
  const applyParchmentBackground = () => {
    if (!parchmentTone) return;
    doc.setFillColor(248, 243, 230); // warm antique vellum
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // 1. Cover Page
  if (includeCoverPage) {
    applyParchmentBackground();

    // Decorative double border
    doc.setDrawColor(120, 85, 45); // vintage bronze/sepia
    doc.setLineWidth(1.2);
    doc.rect(margin - 8, margin - 8, contentWidth + 16, pageHeight - margin * 2 + 16);
    doc.setLineWidth(0.4);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - margin * 2 + 10);

    // Victorian corner ornaments
    const corners = [
      [margin - 5, margin - 5],
      [pageWidth - margin + 5, margin - 5],
      [margin - 5, pageHeight - margin + 5],
      [pageWidth - margin + 5, pageHeight - margin + 5],
    ];
    doc.setFillColor(140, 95, 50);
    corners.forEach(([cx, cy]) => {
      doc.circle(cx, cy, 1.5, 'FD');
    });

    let y = 72;

    // Subtitle / Genre / Category Header
    if (coverCategory) {
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(110, 80, 50);
      doc.text(coverCategory.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 18;
    }

    // Main Title
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(35, 25, 20);
    const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth - 20);
    doc.text(titleLines, pageWidth / 2, y, { align: 'center' });

    y += titleLines.length * 11 + 6;

    // Subtitle if present
    if (subtitle) {
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.setTextColor(90, 65, 45);
      const subLines = doc.splitTextToSize(subtitle, contentWidth - 30);
      doc.text(subLines, pageWidth / 2, y, { align: 'center' });
      y += subLines.length * 7 + 8;
    }

    // Flourish divider
    y += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(150, 110, 65);
    doc.text('❧ ~ ❦ ~ ❧', pageWidth / 2, y, { align: 'center' });

    y += 22;

    // Byline
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(110, 80, 50);
    doc.text('Written & Composed by', pageWidth / 2, y, { align: 'center' });

    y += 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 28, 20);
    doc.text(author, pageWidth / 2, y, { align: 'center' });

    // Place & Era
    if (locationEra) {
      y += 16;
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(120, 85, 55);
      doc.text(`— ${locationEra} —`, pageWidth / 2, y, { align: 'center' });
    }

    // Lower seal note / Colophon
    if (coverSealNote) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(140, 110, 80);
      doc.text(
        coverSealNote.toUpperCase(),
        pageWidth / 2,
        pageHeight - margin - 4,
        { align: 'center' }
      );
    }

    doc.addPage();
  }

  // 2. Manuscript Body Pages
  applyParchmentBackground();

  let currentPageNum = 1;
  const renderHeaderFooter = (page: number) => {
    // Top running header line
    doc.setFont('courier', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 95, 75);
    
    // Left: Customizable header
    if (headerLeftText) {
      doc.text(headerLeftText.slice(0, 36), margin, 15);
    }
    // Right: Customizable place/author header
    if (headerRightText) {
      doc.text(headerRightText.slice(0, 36), pageWidth - margin, 15, { align: 'right' });
    }

    doc.setDrawColor(180, 150, 120);
    doc.setLineWidth(0.2);
    doc.line(margin, 18, pageWidth - margin, 18);

    // Footer with page number
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(130, 105, 85);
    doc.text(`- ${page} -`, pageWidth / 2, pageHeight - 12, { align: 'center' });
  };

  renderHeaderFooter(currentPageNum);

  let cursorY = 28;
  const lineHeight = 6.2;
  const maxY = pageHeight - margin;

  // Split content into lines and paragraphs
  const rawParagraphs = manuscript.content.split('\n');

  doc.setFont('courier', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 22, 16);

  for (const para of rawParagraphs) {
    if (para.trim().length === 0) {
      cursorY += lineHeight * 0.8;
      if (cursorY > maxY) {
        doc.addPage();
        currentPageNum++;
        applyParchmentBackground();
        renderHeaderFooter(currentPageNum);
        cursorY = 28;
      }
      continue;
    }

    // Check if it's a chapter header
    const isChapter = /^CHAPTER\s+[IVXLCDM\d]+/i.test(para.trim());

    if (isChapter) {
      if (cursorY > maxY - 30) {
        doc.addPage();
        currentPageNum++;
        applyParchmentBackground();
        renderHeaderFooter(currentPageNum);
        cursorY = 28;
      }
      cursorY += 6;
      doc.setFont('courier', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(40, 25, 15);
      doc.text(para.trim().toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 8;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 22, 16);
      continue;
    }

    // Normal paragraph text with wrapping
    const wrappedLines = doc.splitTextToSize(para, contentWidth);
    for (const line of wrappedLines) {
      if (cursorY > maxY) {
        doc.addPage();
        currentPageNum++;
        applyParchmentBackground();
        renderHeaderFooter(currentPageNum);
        cursorY = 28;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }
  }

  // Trigger file download
  const safeFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'manuscript';
  doc.save(`${safeFilename}-victorian-manuscript.pdf`);
}

/**
 * Generates an authentic standard Word (.docx) manuscript with customizable headers.
 */
export async function exportToDocx(
  manuscript: Manuscript,
  options?: {
    customTitle?: string;
    customAuthor?: string;
    customSubtitle?: string;
    customLocationEra?: string;
    runningHeaderLeft?: string;
    runningHeaderRight?: string;
  }
): Promise<void> {
  const title = (options?.customTitle ?? manuscript.title).trim() || 'UNTITLED FOLIO';
  const author = (options?.customAuthor ?? manuscript.author).trim() || 'An Anonymous Writer';
  const subtitle = (options?.customSubtitle ?? manuscript.subtitle)?.trim();
  const locationEra = (options?.customLocationEra ?? manuscript.locationEra)?.trim();

  const headerLeft = options?.runningHeaderLeft || `${author} / ${title.toUpperCase()}`;

  const paragraphs: Paragraph[] = [];

  // Top header line
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: headerLeft.slice(0, 50),
          font: 'Courier New',
          size: 20, // 10pt
        }),
      ],
    })
  );

  // Blank spacing
  paragraphs.push(new Paragraph({ children: [] }));
  paragraphs.push(new Paragraph({ children: [] }));

  // Title Block
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: 'Courier New',
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  if (subtitle) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: subtitle,
            font: 'Courier New',
            italics: true,
            size: 24, // 12pt
          }),
        ],
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `by ${author}`,
          font: 'Courier New',
          size: 24,
        }),
      ],
    })
  );

  if (locationEra) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `— ${locationEra} —`,
            font: 'Courier New',
            italics: true,
            size: 20,
          }),
        ],
      })
    );
  }

  paragraphs.push(new Paragraph({ children: [] }));
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '# # #',
          font: 'Courier New',
          size: 24,
        }),
      ],
    })
  );
  paragraphs.push(new Paragraph({ children: [] }));

  // Body content
  const rawParagraphs = manuscript.content.split('\n');
  for (const para of rawParagraphs) {
    if (para.trim().length === 0) {
      paragraphs.push(new Paragraph({ children: [] }));
      continue;
    }

    const isChapter = /^CHAPTER\s+[IVXLCDM\d]+/i.test(para.trim());

    if (isChapter) {
      paragraphs.push(new Paragraph({ children: [] }));
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: para.trim().toUpperCase(),
              font: 'Courier New',
              bold: true,
              size: 24,
            }),
          ],
        })
      );
      paragraphs.push(new Paragraph({ children: [] }));
      continue;
    }

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: para,
            font: 'Courier New',
            size: 24, // 12pt standard
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in dxa
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${title.slice(0, 30)} / `,
                    font: 'Courier New',
                    size: 20,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Courier New',
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'manuscript';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates plain text export.
 */
export function exportToPlainText(manuscript: Manuscript, customFields?: { title?: string; author?: string; locationEra?: string }): void {
  const title = customFields?.title || manuscript.title;
  const author = customFields?.author || manuscript.author;
  const locationEra = customFields?.locationEra || manuscript.locationEra;

  const text = `${title.toUpperCase()}\n` +
    (manuscript.subtitle ? `${manuscript.subtitle}\n` : '') +
    `by ${author}\n` +
    (locationEra ? `${locationEra}\n` : '') +
    `\n========================================================\n\n` +
    manuscript.content;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const safeFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'manuscript';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates Markdown export.
 */
export function exportToMarkdown(manuscript: Manuscript, customFields?: { title?: string; author?: string; locationEra?: string }): void {
  const title = customFields?.title || manuscript.title;
  const author = customFields?.author || manuscript.author;
  const locationEra = customFields?.locationEra || manuscript.locationEra;

  const md = `# ${title}\n\n` +
    (manuscript.subtitle ? `*${manuscript.subtitle}*\n\n` : '') +
    `**Author:** ${author}  \n` +
    (locationEra ? `**Setting:** ${locationEra}  \n` : '') +
    `\n---\n\n` +
    manuscript.content;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const safeFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'manuscript';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
