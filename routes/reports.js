import express from 'express';
import PDFDocument from 'pdfkit';
import Booking from '../models/Booking.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// GET /owner/earnings-report - Owner Route - Generate and download PDF earnings report
router.get('/owner/earnings-report', verifyToken, verifyRole(['Owner']), async (req, res) => {
  try {
    const bookings = await Booking.find({
      ownerId: req.user.id,
      paymentStatus: 'Paid'
    }).sort({ createdAt: -1 });

    // Calculate totals
    const totalEarnings = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalConfirmedBookings = bookings.filter(b => b.bookingStatus === 'Approved').length;
    const totalPendingBookings = bookings.filter(b => b.bookingStatus === 'Pending').length;

    // Create a PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Stream PDF directly to client response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Renterty-Earnings-Report.pdf"');
    doc.pipe(res);

    // --- Header ---
    doc
      .fontSize(24)
      .fillColor('#1e293b')
      .text('Renterty Platform', { align: 'center' })
      .fontSize(14)
      .fillColor('#64748b')
      .text('Property Owner Monthly Earnings Report', { align: 'center' })
      .moveDown();

    // Draw horizontal line
    doc
      .moveTo(50, doc.y)
      .lineTo(562, doc.y)
      .strokeColor('#cbd5e1')
      .stroke()
      .moveDown();

    // --- Owner Info & Summary Cards ---
    doc
      .fontSize(12)
      .fillColor('#0f172a')
      .text(`Owner: ${req.user.email}`)
      .text(`Report Generated On: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // Summary Box
    doc
      .rect(50, doc.y, 512, 100)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    // Add summary labels and values
    const originalY = doc.y + 15;
    doc
      .fillColor('#475569')
      .fontSize(10)
      .text('TOTAL EARNINGS', 70, originalY)
      .fontSize(18)
      .fillColor('#0f172a')
      .text(`$${totalEarnings.toLocaleString()}`, 70, originalY + 18);

    doc
      .fillColor('#475569')
      .fontSize(10)
      .text('CONFIRMED BOOKINGS', 240, originalY)
      .fontSize(18)
      .fillColor('#10b981')
      .text(`${totalConfirmedBookings}`, 240, originalY + 18);

    doc
      .fillColor('#475569')
      .fontSize(10)
      .text('PENDING BOOKINGS', 410, originalY)
      .fontSize(18)
      .fillColor('#f59e0b')
      .text(`${totalPendingBookings}`, 410, originalY + 18);

    // Reset doc positioning after summary box
    doc.y = originalY + 90;
    doc.moveDown();

    // --- Bookings Table ---
    doc
      .fontSize(14)
      .fillColor('#1e293b')
      .text('Recent Payments & Bookings', { underline: true })
      .moveDown();

    // Table Header
    const tableHeaderY = doc.y;
    doc
      .fontSize(10)
      .fillColor('#475569');

    doc.text('Property Name', 50, tableHeaderY);
    doc.text('Tenant', 220, tableHeaderY);
    doc.text('Move-In Date', 340, tableHeaderY);
    doc.text('Status', 440, tableHeaderY);
    doc.text('Amount', 500, tableHeaderY, { align: 'right' });

    doc
      .moveTo(50, tableHeaderY + 15)
      .lineTo(562, tableHeaderY + 15)
      .strokeColor('#cbd5e1')
      .stroke();

    let currentY = tableHeaderY + 22;

    // Table Rows
    bookings.forEach((booking) => {
      // Check if page needs to break
      if (currentY > 700) {
        doc.addPage();
        currentY = 50; // top margin of new page
      }

      doc.fillColor('#0f172a');
      doc.text(booking.propertyName.substring(0, 24), 50, currentY);
      doc.text(booking.tenantEmail.substring(0, 18), 220, currentY);
      doc.text(new Date(booking.moveInDate).toLocaleDateString(), 340, currentY);
      doc.text(booking.bookingStatus, 440, currentY);
      doc.text(`$${booking.amount}`, 500, currentY, { align: 'right' });

      currentY += 20;
    });

    // --- Footer ---
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error generating PDF report', error: error.message });
  }
});

export default router;
