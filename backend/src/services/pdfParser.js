import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'

export async function extractPDFText(buffer) {
  try {
    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  } catch (err) {
    console.error("Failed to parse PDF:", err);
    throw new Error("Unable to parse PDF");
  }
}
