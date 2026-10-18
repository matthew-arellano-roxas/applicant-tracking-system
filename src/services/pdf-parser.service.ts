// // src/services/pdf-parser.service.ts
// import { downloadFile, type BucketName } from '@/services/file-storage.service';
// import { pdfToText, type PdfSource } from '@/utils/pdfToText';

// const assertHasText = (text: string): string => {
//   if (!text) throw new Error('PDF contains no extractable text');
//   return text;
// };

// export const parsePdf = async (source: PdfSource): Promise<string> =>
//   assertHasText(await pdfToText(source));

// export const parsePdfFromStorage = async (bucket: BucketName, path: string): Promise<string> =>
//   parsePdf(await downloadFile(bucket, path));
