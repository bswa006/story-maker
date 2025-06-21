'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { StoryPage } from '@/types/storybook';
import { cn } from '@/lib/utils';
import { PDFGenerator } from '@/services/pdf-generator';
import { useToast } from '@/hooks/use-toast';

interface StoryViewerProps {
  pages: StoryPage[];
  childName: string;
}

export function StoryViewer({ pages, childName }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your storybook.",
      });

      const blob = await PDFGenerator.generateStorybook(pages, childName);
      PDFGenerator.downloadPDF(blob, `${childName}-storybook.pdf`);

      toast({
        title: "PDF Downloaded!",
        description: "Your storybook has been saved.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const currentPageData = pages[currentPage];

  if (!currentPageData) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] bg-gradient-to-b from-sky-100 to-sky-50">
          {currentPageData.imageUrl ? (
            <img
              src={currentPageData.imageUrl}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="text-6xl">{currentPageData.animal ? '🎨' : '📖'}</div>
                <p className="text-muted-foreground">Image generating...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white">
          <div className="text-center space-y-4">
            {currentPageData.animal && (
              <div className="text-4xl mb-2">{currentPageData.animal}</div>
            )}
            <p className="text-lg font-medium whitespace-pre-line">
              {currentPageData.text.replace('{{childName}}', childName)}
            </p>
            {currentPageData.lesson && (
              <p className="text-sm text-muted-foreground italic">
                Lesson: {currentPageData.lesson}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pages.length}
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button 
          className="w-full sm:w-auto" 
          size="lg"
          onClick={handleExportPDF}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Generating PDF...' : 'Download Storybook'}
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-10 gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={cn(
              "aspect-square rounded-lg border-2 transition-colors",
              currentPage === index
                ? "border-primary bg-primary/10"
                : "border-muted hover:border-primary/50"
            )}
          >
            <span className="text-xs">{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}