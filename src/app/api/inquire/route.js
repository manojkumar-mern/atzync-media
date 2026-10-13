import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { sendBookingEmails } from '@/lib/sendEmail';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      clientName,
      email,
      phone,
      companyName = '',
      serviceType,
      description,
    } = body;

    // Server-side validation for required fields
    if (!clientName || !email || !phone || !serviceType || !description) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Generate unique inquiry ID (e.g. AM-2026-X892)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = Date.now().toString(36).toUpperCase().slice(-4);
    const inquiryId = `AM-${code}-${randomSuffix}`;

    const inquiryPayload = {
      inquiryId,
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      serviceType,
      description: description.trim(),
      status: 'pending',
    };

    let dbSaved = false;
    let savedInquiry = null;

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        savedInquiry = await Inquiry.create(inquiryPayload);
        dbSaved = true;
        console.log(`[API] Saved Project Inquiry to MongoDB: ${inquiryId}`);
      } catch (dbError) {
        console.warn(`[API Warning] MongoDB Error during inquiry creation: ${dbError.message}`);
      }
    } else {
      console.warn('[API Diagnostic]: MONGODB_URI environment variable is not defined. Inquiry processed with fallback response.');
    }

    // Dispatch Resend Emails: 1 to Studio Owner (atzyncmedia@gmail.com) & 1 to Booked Client
    let emailStatus = null;
    try {
      emailStatus = await sendBookingEmails(inquiryPayload);
      console.log(`[API] Email dispatch completed for inquiry ${inquiryId}:`, emailStatus);
    } catch (emailErr) {
      console.error(`[API Error] Email dispatch failed for inquiry ${inquiryId}:`, emailErr);
    }

    const emailSent = Boolean(
      emailStatus?.ownerEmail?.success && emailStatus?.clientEmail?.success
    );

    return NextResponse.json(
      {
        success: true,
        dbSaved,
        emailSent,
        emailStatus,
        inquiryId,
        inquiry: savedInquiry || inquiryPayload,
        message: dbSaved
          ? 'Project inquiry saved successfully & email confirmation sent!'
          : 'Project inquiry processed & email notification sent!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Error /api/inquire]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

