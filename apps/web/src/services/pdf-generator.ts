import jsPDF from 'jspdf';
import { StoryPage } from '@/types/storybook';

export class PDFGenerator {
  static async generateStorybook(
    pages: StoryPage[],
    childName: string,
    title: string = "If I Were an Animal..."
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const imageHeight = pageHeight * 0.6;

    // Add cover page
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.text(title, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(20);
    pdf.text(`A Story for ${childName}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text('✨ A Magical Adventure ✨', pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });

    // Add story pages
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      pdf.addPage();

      // Add image placeholder or actual image
      if (page.imageUrl) {
        try {
          await this.addImageToPDF(pdf, page.imageUrl, margin, margin, contentWidth, imageHeight);
        } catch (error) {
          console.error('Failed to add image:', error);
          this.addImagePlaceholder(pdf, margin, margin, contentWidth, imageHeight);
        }
      } else {
        this.addImagePlaceholder(pdf, margin, margin, contentWidth, imageHeight);
      }

      // Add text
      const textY = margin + imageHeight + 15;
      
      if (page.animal) {
        pdf.setFontSize(24);
        pdf.text(page.animal, pageWidth / 2, textY, { align: 'center' });
      }

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      const lines = pdf.splitTextToSize(
        page.text.replace('{{childName}}', childName),
        contentWidth
      );
      
      let currentY = textY + (page.animal ? 15 : 5);
      lines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, currentY, { align: 'center' });
        currentY += 7;
      });

      // Add lesson if present
      if (page.lesson) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(11);
        pdf.text(`Lesson: ${page.lesson}`, pageWidth / 2, currentY + 5, { align: 'center' });
      }

      // Add page number
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    return pdf.output('blob');
  }

  private static async addImageToPDF(
    pdf: jsPDF,
    imageUrl: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(dataUrl, 'JPEG', x, y, width, height);
            resolve();
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  private static addImagePlaceholder(
    pdf: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    pdf.setDrawColor(200);
    pdf.rect(x, y, width, height);
    pdf.setFontSize(20);
    pdf.text('🎨 Image Loading...', x + width / 2, y + height / 2, { align: 'center' });
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}