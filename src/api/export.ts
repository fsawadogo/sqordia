import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'pptx' | 'html' | 'txt';
  includeTitle: boolean;
  includeTOC: boolean;
  includePageNumbers: boolean;
  sections: string[];
}

// Helper function to get formatted date for filenames
const getFormattedDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Helper function to validate UUID
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Main export function
export const exportBusinessPlan = async (
  planId: string,
  options: ExportOptions
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // Validate planId to prevent invalid input syntax errors
    if (!planId || !isValidUuid(planId)) {
      throw new Error("Invalid business plan ID provided");
    }
    
    // Get the business plan data
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select('title, description, user_id')
      .maybeSingle(); // Use maybeSingle instead of single to prevent error when no rows found
    
    if (planError) throw planError;
    
    // Check if planData exists
    if (!planData) {
      throw new Error(`Business plan with ID ${planId} not found`);
    }
    
    // Get the sections content
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('plan_sections')
      .select(`
        id,
        content,
        section_order,
        sections:section_id (
          title
        )
      `)
      .eq('business_plan_id', planId)
      .in('section_id', options.sections)
      .order('section_order');
    
    if (sectionsError) throw sectionsError;
    
    // Format the plan title for filename
    const planTitle = planData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${planTitle}_${getFormattedDate()}`;
    
    // Generate the document based on format
    if (options.format === 'html') {
      // For HTML format, we can directly generate and download it
      const htmlContent = generateHTMLContent(planData, sectionsData, options);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${fileName}.html`);
      
    } else if (options.format === 'txt') {
      // For text format, directly generate and download
      const txtContent = generateTXTContent(planData, sectionsData, options);
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
      
    } else if (options.format === 'pdf') {
      // For PDF, use the improved generatePDF function
      await generatePDF(planData, sectionsData, options, fileName);
      
    } else if (options.format === 'docx' || options.format === 'pptx') {
      // Create a downloadable HTML version that can be converted to DOCX/PPTX
      const htmlContent = generateDownloadHTML(planData, sectionsData, options);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${fileName}.${options.format === 'docx' ? 'html' : 'html'}`);
    }
    
    // Log the export activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: planData.user_id,
        business_plan_id: planId,
        activity_type: 'export',
        description: `Exported business plan "${planData.title}" as ${options.format.toUpperCase()}`
      }]);
      
    return { success: true, error: null };
  } catch (error) {
    console.error('Error exporting business plan:', error);
    return { success: false, error: error as Error };
  }
};

// Completely revamped PDF generation function using a more reliable approach
const generatePDF = async (planData, sectionsData, options: ExportOptions, fileName: string) => {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40; // margins in points
    
    let pageNumber = 1;
    let currentY = margin;
    
    // Title page
    if (options.includeTitle) {
      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(23, 93, 220); // Primary blue
      
      const title = planData.title;
      const titleLines = pdf.splitTextToSize(title, pageWidth - (margin * 2));
      
      // Calculate center position
      const titleHeight = titleLines.length * 28; // approx line height
      pdf.text(titleLines, pageWidth / 2, 150, { align: 'center' });
      
      // Add description if available
      if (planData.description) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100); // Gray
        
        const descLines = pdf.splitTextToSize(planData.description, pageWidth - (margin * 2));
        pdf.text(descLines, pageWidth / 2, 150 + titleHeight + 30, { align: 'center' });
      }
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - margin);
      
      // Add page number if enabled
      if (options.includePageNumbers) {
        pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
      }
      
      // Add a new page
      pdf.addPage();
      pageNumber++;
    }
    
    // Table of Contents
    if (options.includeTOC) {
      currentY = margin;
      
      pdf.setFontSize(18);
      pdf.setTextColor(23, 93, 220);
      pdf.text('Table of Contents', margin, currentY);
      currentY += 30;
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      for (let i = 0; i < sectionsData.length; i++) {
        const section = sectionsData[i];
        const pageNum = i + (options.includeTitle ? 3 : 2); // Calculate page number
        
        // Draw section title with page number
        pdf.text(`${i + 1}. ${section.sections.title}`, margin, currentY);
        pdf.text(`${pageNum}`, pageWidth - margin, currentY, { align: 'right' });
        
        // Add dotted line between title and page number
        const titleWidth = pdf.getTextWidth(`${i + 1}. ${section.sections.title}`) + 5;
        const pageNumWidth = pdf.getTextWidth(`${pageNum}`) + 5;
        const lineStart = margin + titleWidth;
        const lineEnd = pageWidth - margin - pageNumWidth;
        
        let xPos = lineStart;
        while (xPos < lineEnd) {
          pdf.text('.', xPos, currentY);
          xPos += 5;
        }
        
        currentY += 20;
        
        // Check if we need a new page
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          pageNumber++;
          currentY = margin;
          
          if (options.includePageNumbers) {
            pdf.setFontSize(10);
            pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
            pdf.setFontSize(12);
          }
        }
      }
      
      pdf.addPage();
      pageNumber++;
    }
    
    // Content pages
    for (let i = 0; i < sectionsData.length; i++) {
      const section = sectionsData[i];
      currentY = margin;
      
      // Section title
      pdf.setFontSize(18);
      pdf.setTextColor(23, 93, 220);
      pdf.text(section.sections.title, margin, currentY);
      currentY += 30;
      
      // Content
      if (section.content) {
        // Create a temporary div to hold the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = section.content;
        tempDiv.style.width = `${pageWidth - (margin * 2)}px`;
        tempDiv.style.padding = '10px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.color = '#000';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Set basic styles for proper HTML rendering
        const contentStyles = document.createElement('style');
        contentStyles.textContent = `
          p { margin-bottom: 10px; }
          h1 { font-size: 18pt; margin: 10px 0; }
          h2 { font-size: 16pt; margin: 10px 0; }
          h3 { font-size: 14pt; margin: 8px 0; }
          ul, ol { margin-left: 20px; margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        `;
        tempDiv.appendChild(contentStyles);
        
        try {
          // Convert HTML to canvas and add to PDF
          await html2canvas(tempDiv, {
            scale: 1.5, // Higher resolution
            useCORS: true,
            allowTaint: true,
            logging: false, // Disable logging
            backgroundColor: '#fff'
          }).then(canvas => {
            // Calculate the proper scaling to fit the page width
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add content image to PDF, potentially across multiple pages if needed
            let remainingHeight = imgHeight;
            let srcY = 0;
            
            while (remainingHeight > 0) {
              // Calculate how much content fits on the current page
              const availableHeight = pageHeight - currentY - margin;
              const heightOnThisPage = Math.min(availableHeight, remainingHeight);
              
              if (heightOnThisPage > 0) {
                // Add the appropriate portion of the image to the current page
                pdf.addImage(
                  imgData,
                  'PNG',
                  margin,
                  currentY,
                  imgWidth,
                  heightOnThisPage,
                  undefined,
                  'FAST',
                  0,
                  srcY,
                  canvas.width,
                  (heightOnThisPage * canvas.width) / imgWidth
                );
                
                remainingHeight -= heightOnThisPage;
                srcY += (heightOnThisPage * canvas.width) / imgWidth;
                
                // If content continues to next page and there's remaining height, add a new page
                if (remainingHeight > 0) {
                  pdf.addPage();
                  pageNumber++;
                  currentY = margin;
                  
                  // Add page number if enabled
                  if (options.includePageNumbers) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
                    pdf.setFontSize(12);
                    pdf.setTextColor(0, 0, 0);
                  }
                } else {
                  currentY += heightOnThisPage + 20; // Add some space after content
                }
              } else {
                // Start fresh on a new page if no space available
                pdf.addPage();
                pageNumber++;
                currentY = margin;
                
                if (options.includePageNumbers) {
                  pdf.setFontSize(10);
                  pdf.setTextColor(100, 100, 100);
                  pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
                  pdf.setFontSize(12);
                  pdf.setTextColor(0, 0, 0);
                }
              }
            }
          });
        } catch (canvasError) {
          // Fallback if html2canvas fails - use plain text
          console.warn('HTML2Canvas error, falling back to plain text:', canvasError);
          
          const plainText = tempDiv.textContent || '[No content]';
          const textLines = pdf.splitTextToSize(plainText, pageWidth - (margin * 2));
          
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(textLines, margin, currentY);
          currentY += textLines.length * 15 + 20;
        }
        
        // Clean up
        document.body.removeChild(tempDiv);
      } else {
        // If no content, add placeholder text
        pdf.setFontSize(12);
        pdf.setTextColor(150, 150, 150);
        pdf.text("[No content for this section]", margin, currentY);
        currentY += 20;
      }
      
      // Add a new page if there's another section coming
      if (i < sectionsData.length - 1) {
        pdf.addPage();
        pageNumber++;
        
        // Add page number if enabled
        if (options.includePageNumbers) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
        }
      }
    }
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Convert HTML to plain text
const htmlToPlainText = (html: string): string => {
  // Create a temporary div
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

// Generate HTML content
const generateHTMLContent = (planData, sectionsData, options: ExportOptions) => {
  const { title, description } = planData;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1d4ed8;
      margin-top: 30px;
    }
    .description {
      font-style: italic;
      color: #666;
      margin-bottom: 30px;
    }
    .toc {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .toc h2 {
      margin-top: 0;
    }
    .toc ul {
      padding-left: 20px;
    }
    .toc a {
      color: #3b82f6;
      text-decoration: none;
    }
    .toc a:hover {
      text-decoration: underline;
    }
    .section {
      margin-bottom: 30px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>`;

  // Add title
  if (options.includeTitle) {
    html += `
  <h1>${title}</h1>
  ${description ? `<p class="description">${description}</p>` : ''}`;
  }
  
  // Add table of contents
  if (options.includeTOC) {
    html += `
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>`;
    
    sectionsData.forEach(section => {
      const sectionId = section.sections.title.replace(/\s+/g, '-').toLowerCase();
      html += `
      <li><a href="#${sectionId}">${section.sections.title}</a></li>`;
    });
    
    html += `
    </ul>
  </div>`;
  }
  
  // Add sections
  sectionsData.forEach(section => {
    const sectionId = section.sections.title.replace(/\s+/g, '-').toLowerCase();
    html += `
  <div class="section" id="${sectionId}">
    <h2>${section.sections.title}</h2>
    ${section.content || `<p><em>No content for this section yet.</em></p>`}
  </div>`;
  });
  
  html += `
</body>
</html>`;

  return html;
};

// Generate printable HTML specifically formatted for better PDF printing
const generatePrintableHTML = (planData, sectionsData, options: ExportOptions) => {
  const { title, description } = planData;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
      font-size: 12pt;
    }
    .page-break {
      page-break-after: always;
    }
    h1 {
      font-size: 24pt;
      color: #2563eb;
      border-bottom: 1pt solid #2563eb;
      padding-bottom: 16pt;
      margin-bottom: 24pt;
    }
    h2 {
      font-size: 18pt;
      color: #1d4ed8;
      margin-top: 24pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14pt;
      margin-top: 20pt;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 12pt;
      orphans: 3;
      widows: 3;
    }
    .description {
      font-style: italic;
      color: #666;
      margin-bottom: 24pt;
    }
    .toc {
      margin-bottom: 24pt;
    }
    .toc h2 {
      margin-top: 0;
    }
    .toc ul {
      padding-left: 20pt;
      list-style-type: none;
    }
    .toc li {
      margin-bottom: 8pt;
    }
    .toc-entry {
      display: flex;
      width: 100%;
      align-items: baseline;
    }
    .toc-dots {
      flex: 1;
      border-bottom: 1pt dotted #ccc;
      margin: 0 5pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16pt 0;
    }
    table, th, td {
      border: 1pt solid #ddd;
    }
    th, td {
      padding: 8pt;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    ul, ol {
      margin-bottom: 16pt;
    }
    li {
      margin-bottom: 4pt;
    }
    .section {
      margin-bottom: 24pt;
    }
    .footer {
      text-align: center;
      font-size: 9pt;
      color: #666;
      margin-top: 24pt;
    }
    .cover-title {
      text-align: center;
      margin-top: 200px;
      margin-bottom: 40px;
    }
    .cover-description {
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }
    .cover-date {
      text-align: center;
      margin-top: 100px;
    }
    .toc-content {
      padding: 20px;
    }
    @media print {
      body {
        color: black;
      }
    }
  </style>
</head>
<body>`;

  // Cover page
  html += `
  <div class="cover-page">
    <div class="cover-title">
      <h1 style="border-bottom: none; font-size: 28pt; margin-bottom: 20px;">${title}</h1>
    </div>
    ${description ? `
    <div class="cover-description">
      <p style="font-size: 14pt;">${description}</p>
    </div>` : ''}
    <div class="cover-date">
      <p style="font-size: 12pt;">Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
  <div class="page-break"></div>`;
  
  // Table of contents
  if (options.includeTOC) {
    html += `
  <div class="toc-content">
    <h2>Table of Contents</h2>
    <ul>`;
    
    sectionsData.forEach((section, index) => {
      html += `
      <li>
        <div class="toc-entry">
          <span>${index + 1}. ${section.sections.title}</span>
          <span class="toc-dots"></span>
          <span>${index + 2}</span>
        </div>
      </li>`;
    });
    
    html += `
    </ul>
  </div>
  <div class="page-break"></div>`;
  }
  
  // Add sections
  sectionsData.forEach((section, index) => {
    const sectionContent = section.content || `<p><em>No content for this section yet.</em></p>`;
    
    html += `
  <div class="section" id="section-${section.id}">
    <h2>${section.sections.title}</h2>
    ${sectionContent}
  </div>`;
    
    // Add page break after each section except the last one
    if (index < sectionsData.length - 1) {
      html += `
  <div class="page-break"></div>`;
    }
  });
  
  // Footer
  html += `
  <div class="footer">
    ${title} - Business Plan | Page <span class="page-number"></span>
  </div>
</body>
</html>`;

  return html;
};

// Generate a downloadable HTML that explains to the user how to convert to DOCX/PPTX
const generateDownloadHTML = (planData, sectionsData, options: ExportOptions) => {
  const { title, description } = planData;
  const format = options.format.toUpperCase();
  
  // Generate the content as in HTML format
  let content = generateHTMLContent(planData, sectionsData, options);
  
  // Add instructions at the top
  const instructions = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${format} Export</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .instructions {
      background-color: #f0f4ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 0 4px 4px 0;
    }
    .instructions h2 {
      margin-top: 0;
      color: #2563eb;
    }
    .instructions ol {
      padding-left: 20px;
    }
    .instructions li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="instructions">
    <h2>How to Save as ${format}</h2>
    <p>This document has been prepared for export to ${format} format. Please follow these steps:</p>
    <ol>
      <li>Select all content (Ctrl+A or Cmd+A)</li>
      <li>Copy the content (Ctrl+C or Cmd+C)</li>
      <li>Open your word processor (Microsoft Word, Google Docs, etc.)</li>
      <li>Create a new document</li>
      <li>Paste the content (Ctrl+V or Cmd+V)</li>
      <li>Save the file as ${format} format from your word processor</li>
    </ol>
    <p><strong>Note:</strong> Some formatting may need adjustment after pasting.</p>
  </div>`;
  
  // Insert instructions at the beginning of the content (after the <body> tag)
  content = content.replace('<body>', '<body>' + instructions);
  
  return content;
};

// Generate plain text content
const generateTXTContent = (planData, sectionsData, options: ExportOptions) => {
  const { title, description } = planData;
  
  let text = `${title}\n`;
  text += '='.repeat(title.length) + '\n\n';
  
  if (description) {
    text += `${description}\n\n`;
    text += '-'.repeat(50) + '\n\n';
  }
  
  // Add table of contents
  if (options.includeTOC) {
    text += 'TABLE OF CONTENTS\n';
    text += '-'.repeat(16) + '\n\n';
    
    sectionsData.forEach((section, index) => {
      text += `${index + 1}. ${section.sections.title}\n`;
    });
    
    text += '\n' + '-'.repeat(50) + '\n\n';
  }
  
  // Add sections
  sectionsData.forEach((section, index) => {
    text += `${section.sections.title}\n`;
    text += '-'.repeat(section.sections.title.length) + '\n\n';
    
    // Convert HTML content to plain text (very basic conversion)
    const plainContent = section.content ? 
      section.content
        .replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, '$1\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<li>(.*?)<\/li>/g, '* $1\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<(?:.|\n)*?>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      : 'No content for this section yet.';
    
    text += plainContent + '\n\n';
    
    if (index < sectionsData.length - 1) {
      text += '='.repeat(50) + '\n\n';
    }
  });
  
  return text;
};