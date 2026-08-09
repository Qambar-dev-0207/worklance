import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Worklance — Connect • Train • Get Hired",
    template: "%s | Worklance",
  },
  description:
    "The complete Career Operating System combining tech job search, recruiter directory, hackathons, interview PYQs, and ATS resume building.",
  keywords: [
    "Worklance",
    "Job Search",
    "Tech Jobs",
    "Developer Jobs India",
    "Recruiter Directory",
    "Hackathons",
    "Interview Preparation",
    "ATS Resume Builder",
  ],
  authors: [{ name: "Worklance Team" }],
  openGraph: {
    title: "Worklance — Connect • Train • Get Hired",
    description:
      "The complete Career Operating System combining tech job search, recruiter directory, hackathons, interview PYQs, and ATS resume building.",
    url: "https://worklance.vercel.app",
    siteName: "Worklance",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Worklance Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Worklance — Connect • Train • Get Hired",
    description: "The complete Career Operating System for modern software engineers and recruiters.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Worklance",
    url: "https://worklance.vercel.app",
    description: "Connect, Train, and Get Hired with Worklance Career Operating System.",
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
