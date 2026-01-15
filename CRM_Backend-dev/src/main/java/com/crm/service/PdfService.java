
//=============================================================================
// Updated PdfService to replicate uploaded invoice design
// Updated PdfService with safe fallback and required field changes
//package com.crm.service;
//
//import com.itextpdf.text.*;
//import com.itextpdf.text.pdf.*;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.stereotype.Service;
//
//import java.io.File;
//import java.io.FileOutputStream;
//import java.lang.reflect.Field;
//import java.nio.file.Files;
//import java.nio.file.Paths;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//
//@Service
//public class PdfService {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(PdfService.class);
//    private static final String PDF_STORAGE_DIR = "docs/generatedbill/";
//
//    public File createPDF(Object billObject) {
//        try {
//            Files.createDirectories(Paths.get(PDF_STORAGE_DIR));
//            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
//            String filePath = PDF_STORAGE_DIR + timestamp + ".pdf";
//            File pdfFile = new File(filePath);
//
//            Document document = new Document(PageSize.A4);
//            PdfWriter.getInstance(document, new FileOutputStream(pdfFile));
//            document.open();
//
//            // Header
//            Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
//            Font smallFont = new Font(Font.FontFamily.HELVETICA, 10);
//            Paragraph company = new Paragraph("Digital Buddiess Nagpur", boldFont);
//            document.add(company);
//            document.add(new Paragraph("3rd Floor, Narang Tower, Palm Rd, Collectors Colony, Civil Lines,", smallFont));
//            document.add(new Paragraph("Nagpur, Maharashtra-440001", smallFont));
//            document.add(new Paragraph("Phone no. : 9404085316, 9545871746", smallFont));
//            document.add(new Paragraph("Email : buddiess.digital@gmail.com", smallFont));
//            document.add(new Paragraph("State: 27-Maharashtra", smallFont));
//            document.add(Chunk.NEWLINE);
//
//            Paragraph invoiceTitle = new Paragraph("TAX INVOICE", new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD));
//            invoiceTitle.setAlignment(Element.ALIGN_CENTER);
//            document.add(invoiceTitle);
//            document.add(Chunk.NEWLINE);
//
//            // Bill To and Invoice Details
//            PdfPTable topTable = new PdfPTable(2);
//            topTable.setWidthPercentage(100);
//            PdfPCell left = new PdfPCell();
//            left.setBorder(Rectangle.NO_BORDER);
//            left.addElement(new Paragraph("Bill To", boldFont));
//            left.addElement(new Paragraph(getFieldValue(billObject, "customerName"), smallFont));
//            left.addElement(new Paragraph(getFieldValue(billObject, "customerAddress", "Abhayankar Nagar Square, Nagpur"), smallFont));
//            left.addElement(new Paragraph("Contact No. : " + getFieldValue(billObject, "phno"), smallFont));
//
//            PdfPCell right = new PdfPCell();
//            right.setBorder(Rectangle.NO_BORDER);
//            right.addElement(new Paragraph("Invoice Details", boldFont));
//            right.addElement(new Paragraph("Invoice No. : " + getFieldValue(billObject, "invoiceNumber", "738"), smallFont));
//            right.addElement(new Paragraph("Date : " + getFieldValue(billObject, "billingDate"), smallFont));
//
//            topTable.addCell(left);
//            topTable.addCell(right);
//            document.add(topTable);
//            document.add(Chunk.NEWLINE);
//
//            // Item Table
//            PdfPTable itemTable = new PdfPTable(new float[]{1, 4, 2, 1, 2, 2});
//            itemTable.setWidthPercentage(100);
//            addHeaderRow(itemTable, "#", "Item name", "HSN/ SAC", "Quantity", "Price/ Unit", "Amount");
//            itemTable.addCell("1");
//            itemTable.addCell(getServiceDescription(billObject));
//            itemTable.addCell(" ");
//            itemTable.addCell("1");
//            itemTable.addCell(getAmountOnly(billObject));
//            itemTable.addCell(getAmountOnly(billObject));
//            document.add(itemTable);
//            document.add(Chunk.NEWLINE);
//
//            // Totals
//            PdfPTable totals = new PdfPTable(2);
//            totals.setWidthPercentage(40);
//            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
//            addTableRow(totals, "Sub Total", getAmountOnly(billObject));
//            addTableRow(totals, "Total", getAmountOnly(billObject));
//            addTableRow(totals, "Received", "₹ 0.00");
//            addTableRow(totals, "Balance", getAmountOnly(billObject));
//            document.add(totals);
//            document.add(Chunk.NEWLINE);
//
//            document.add(new Paragraph("Invoice Amount In Words", boldFont));
//            document.add(new Paragraph("Twenty Thousand Rupees only", smallFont));
//            document.add(Chunk.NEWLINE);
//
//            // Terms
//            document.add(new Paragraph("Terms and Conditions", boldFont));
//            document.add(new Paragraph("All invoices raised needs to be paid within 2 calendar days from date of invoice. If not done, panalty will be applicable", smallFont));
//            document.add(Chunk.NEWLINE);
//
//            // Bank Details
//            document.add(new Paragraph("Pay To:", boldFont));
//            document.add(new Paragraph("Bank Name : BANK OF BARODA, MAHAL-NAGPUR BRANCH", smallFont));
//            document.add(new Paragraph("Bank Account No. : 11970100020463", smallFont));
//            document.add(new Paragraph("Bank IFSC code : BARB0MAHNAG", smallFont));
//            document.add(new Paragraph("Account holder's name : Bhojendra Soni", smallFont));
//            document.add(Chunk.NEWLINE);
//
//            // Signatory
//            document.add(new Paragraph("Authorized Signatory", boldFont));
//            document.close();
//
//            return pdfFile;
//
//        } catch (Exception e) {
//            LOGGER.error("Error generating bill PDF", e);
//            throw new RuntimeException("Error generating bill PDF", e);
//        }
//    }
//
//    private void addHeaderRow(PdfPTable table, String... headers) {
//        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
//        for (String header : headers) {
//            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
//            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
//            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
//            table.addCell(cell);
//        }
//    }
//
//    private void addTableRow(PdfPTable table, String key, String value) {
//        Font font = new Font(Font.FontFamily.HELVETICA, 10);
//        table.addCell(new Phrase(key, font));
//        table.addCell(new Phrase(value, font));
//    }
//
//    private String getServiceDescription(Object billObject) {
//        return getFieldValue(billObject, "serviceTitle") + ", " + getFieldValue(billObject, "serviceDesc");
//    }
//
//    private String getAmountOnly(Object billObject) {
//    	System.err.println("flow in getmamount only method");
//        String amount = getFieldValue(billObject, "billAmount");
//        return "₹ " + (amount != null ? amount : "0.00");
//    }
//
//    private String getFieldValue(Object object, String fieldName) {
//    	
//        return getFieldValue(object, fieldName, "N/A");
//    }
//
//    private String getFieldValue(Object object, String fieldName, String defaultValue) {
//        try {
//            Field field = object.getClass().getDeclaredField(fieldName);
//            field.setAccessible(true);
//            Object value = field.get(object);
//            return value != null ? value.toString() : defaultValue;
//        } catch (Exception e) {
//            LOGGER.warn("Optional field not found: {}", fieldName);
//            return defaultValue;
//        }
//    }
//}
package com.crm.service;

import com.itextpdf.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Random;


@Service
public class PdfService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PdfService.class);
    private static final String PDF_STORAGE_DIR = "docs/generatedbill/";
    private static final String TEMPLATE_PATH = "docs/templates/Coffee Point - Invoice(5).pdf"; // adjust as needed

    public File createPDF(Object billObject) {
        try {
            Files.createDirectories(Paths.get(PDF_STORAGE_DIR));
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filePath = PDF_STORAGE_DIR + timestamp + ".pdf";
            File outputFile = new File(filePath);

            PdfReader reader = new PdfReader(TEMPLATE_PATH);
            PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(outputFile));
            PdfContentByte canvas = stamper.getOverContent(1);

            BaseFont font = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            float fontSize = 9f;

            // Get and convert bill amount
            double amount = Double.parseDouble(getFieldValue(billObject, "billAmount"));
            int roundedAmount = (int) amount;
            String amountStr = formatWithCommas(roundedAmount);
            String amountInWords = convertToWords(roundedAmount) + " ONLY";
            String invoiceNumber=generateInvoiceNumber();
            // Draw customer info and billing data
            drawText(canvas, getFieldValue(billObject, "customerName"), 35, 655, font, fontSize);
            drawText(canvas, getFieldValue(billObject, "phno"), 35, 640, font, fontSize);
            drawText(canvas, invoiceNumber, 540, 653, font, fontSize);
            drawText(canvas, getFieldValue(billObject, "billingDate"), 520, 635, font, fontSize);

            // Item description split into multiple lines
            String fullItemText = getFieldValue(billObject, "serviceTitle") + " - " +
                                  getFieldValue(billObject, "serviceDesc");

            int maxCharsPerLine = 32;
            int lineHeight = 12;
            int startY = 600;

            String[] lines = fullItemText.split("(?<=\\G.{" + maxCharsPerLine + "})");
            for (int i = 0; i < lines.length; i++) {
                drawText(canvas, lines[i], 60, startY - (i * lineHeight), font, fontSize);
            }

            // Print numeric amount
            drawText(canvas, amountStr, 440, 597, font, fontSize);//price unit
            drawText(canvas, amountStr, 520, 597, font, fontSize);	//amount
            drawText(canvas, amountStr, 518, 530, font, fontSize);	//subtotal
            drawText(canvas, amountStr, 518, 512, font, fontSize);	//total
            drawText(canvas, amountStr, 518, 477, font, fontSize); // Balance

            // Print amount in words (adjust Y as per design)
            drawText(canvas, amountInWords, 35, 515, font, fontSize);

            stamper.close();
            reader.close();

            return outputFile;

        } catch (Exception e) {
            LOGGER.error("Error generating PDF from template using coordinates", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void drawText(PdfContentByte canvas, String text, float x, float y, BaseFont font, float size) {
        canvas.beginText();
        canvas.setFontAndSize(font, size);
        canvas.setTextMatrix(x, y);
        canvas.showText(text != null ? text : "");
        canvas.endText();
    }

    private String getFieldValue(Object object, String fieldName) {
        try {
            Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            Object value = field.get(object);
            return value != null ? value.toString() : "";
        } catch (Exception e) {
            LOGGER.warn("Field not found: {}", fieldName);
            return "";
        }
    }

    // Number to words conversion logic
    private static final String[] units = {
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };
    private static final String[] tens = {
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    private String convertToWords(int n) {
        if (n == 0) return "Zero";
        return convert(n).trim();
    }

    private String convert(int n) {
        if (n < 20) return units[n];
        if (n < 100) return tens[n / 10] + " " + units[n % 10];
        if (n < 1000) return units[n / 100] + " Hundred " + convert(n % 100);
        if (n < 100000) return convert(n / 1000) + " Thousand " + convert(n % 1000);
        if (n < 10000000) return convert(n / 100000) + " Lakh " + convert(n % 100000);
        return convert(n / 10000000) + " Crore " + convert(n % 10000000);
    }
    
    private String formatWithCommas(double amount) {
        NumberFormat formatter = NumberFormat.getInstance(new Locale("en", "IN"));
        formatter.setMaximumFractionDigits(0);
        formatter.setGroupingUsed(true); 
        return formatter.format((long) amount);
    }
    
    private String generateInvoiceNumber() {
    	int invoicenumber=new Random().nextInt(900)+100; 
        return String.valueOf(invoicenumber); // generates number between 100–999
    }

}

