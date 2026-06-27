"use client";

import { Mail, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16 bg-bg-base">
      <div className="container-section">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-accent">お問い合わせ</h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            高北おやじの会への入会希望や活動に関するお問い合わせは、メールにてお願いします。
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-accent text-white p-6 md:p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2">
              連絡先情報
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-1">メールアドレス</h3>
                <p>
                  <a
                    href="mailto:takasukitaoyajinokai@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    <span>takasukitaoyajinokai@gmail.com</span>
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-1">入会について</h3>
                <p>入会費用はかかりません。</p>
                <p>
                  入会いただきますと、おやじの会の連絡メールが届くようになります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
