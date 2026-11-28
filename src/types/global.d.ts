/**
 * Module type declarations for packages without built-in types.
 */

declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: { mode?: string[] };
  }

  interface Html2PdfInstance {
    set: (opt: Html2PdfOptions) => Html2PdfInstance;
    from: (el: HTMLElement) => Html2PdfInstance;
    save: () => Promise<void>;
    toPdf: () => Html2PdfInstance;
    outputPdf: (type?: string) => Promise<unknown>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
