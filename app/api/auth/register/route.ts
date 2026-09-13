import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signToken, isValidEmail, isValidPassword, analyzePassword } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role, company, title } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json({ success: false, error: 'Full name must be at least 2 characters' }, { status: 400 });
    }

    const lowerEmail = email.trim().toLowerCase();
    if (!isValidEmail(lowerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address (e.g. name@domain.com)' },
        { status: 400 }
      );
    }

    const pwdAnalysis = analyzePassword(password);
    if (!pwdAnalysis.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Password must be at least 8 characters and include uppercase, lowercase, number, and special character. Missing: ${pwdAnalysis.missingRequirements.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const userRole = role === 'recruiter' ? 'recruiter' : 'seeker';

    if (isMockDB()) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            success: false,
            error: 'Production database connection is unavailable. Please verify Atlas connection or try again in a few moments.',
          },
          { status: 503 }
        );
      }

      const existing = mockStore.users.find((u) => u.email === lowerEmail);
      if (existing) {
        return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        _id: 'usr_' + Date.now(),
        id: 'usr_' + Date.now(),
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: userRole,
        company: company || '',
        title: title || (userRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'),
        avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString(),
      };

      mockStore.users.push(newUser);

      const token = signToken({
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role as any,
        name: newUser.name,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company,
          title: newUser.title,
          avatar: newUser.avatar,
        },
        token,
      });

      response.cookies.set('worklance_token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: userRole,
      company: company || '',
      title: title || (userRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'),
      avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company,
        title: newUser.title,
        avatar: newUser.avatar,
      },
      token,
    });

    response.cookies.set('worklance_token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
