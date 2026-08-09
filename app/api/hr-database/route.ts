import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import HrContact from '@/models/HrContact';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const industry = searchParams.get('industry') || '';

    if (isMockDB()) {
      let filtered = [...mockStore.hrContacts];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.company.toLowerCase().includes(s) ||
            c.designation.toLowerCase().includes(s)
        );
      }

      if (city && city !== 'All') {
        filtered = filtered.filter((c) => c.city.toLowerCase().includes(city.toLowerCase()));
      }

      if (industry && industry !== 'All') {
        filtered = filtered.filter((c) => c.industry.toLowerCase().includes(industry.toLowerCase()));
      }

      return NextResponse.json({ success: true, count: filtered.length, contacts: filtered });
    }

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }

    if (industry && industry !== 'All') {
      query.industry = { $regex: industry, $options: 'i' };
    }

    const contacts = await HrContact.find(query).sort({ verified: -1, createdAt: -1 });
    return NextResponse.json({ success: true, count: contacts.length, contacts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
