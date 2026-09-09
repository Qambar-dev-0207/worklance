import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function GET(req: NextRequest) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    if (isMockDB()) {
      const mockUser = mockStore.users.find(
        (u) => u._id === authData.userId || u.id === authData.userId || u.email === authData.email
      );

      if (mockUser) {
        const { password, ...userWithoutPassword } = mockUser as any;
        return NextResponse.json({ success: true, user: userWithoutPassword });
      }

      // Graceful fallback to verified token claims if mock store was reset
      return NextResponse.json({
        success: true,
        user: {
          id: authData.userId,
          _id: authData.userId,
          email: authData.email,
          role: authData.role,
          name: authData.name,
        },
      });
    }

    try {
      const user = await User.findById(authData.userId).select('-password');
      if (user) {
        return NextResponse.json({ success: true, user });
      }
    } catch (dbErr) {
      console.warn('DB lookup failed in /api/auth/me, falling back to token payload:', dbErr);
    }

    // Fallback to verified token payload to keep session intact
    return NextResponse.json({
      success: true,
      user: {
        id: authData.userId,
        _id: authData.userId,
        email: authData.email,
        role: authData.role,
        name: authData.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('worklance_token', '', { path: '/', maxAge: 0 });
  return response;
}
