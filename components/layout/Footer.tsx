import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-white">
      <div className="container-section py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">高北おやじの会</h3>
            <p className="mb-4">
              高洲北小学校の父親たちによるコミュニティ活動グループです。子どもたちと一緒に楽しむ活動を通じて、
              地域の絆を深め、子どもたちの健全な成長を支援しています。
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">連絡先</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 shrink-0" />
                <a
                  href="mailto:takasukitaoyajinokai@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center"
                >
                  <span>takasukitaoyajinokai@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">
                  私たちについて
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:underline">
                  活動内容
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  ブログ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p>© {currentYear} 高北おやじの会 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
