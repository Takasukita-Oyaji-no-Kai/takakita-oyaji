import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

const activities = [
  {
    id: "mochi-tsuki",
    title: "餅つき",
    date: "1月",
    location: "高洲北小学校",
    description:
      "新年の風物詩として、親子や地域のメンバーが集まり、杵と臼を使って協力しながら餅つきを行います。つきたてのお餅をみんなで丸めて味わい、一年の健康と幸せを願う温かな交流の場です。",
    image: "/assets/mochi-tsuki.jpeg",
  },
  {
    id: "sports-day",
    title: "運動会",
    date: "5月",
    location: "高洲北小学校",
    description:
      "親子や地域の参加者がチームに分かれて競技を楽しむ運動会です。かけっこ、玉入れ、綱引きなど多彩な種目を通して、チームワークや体力づくりを促進しながら、世代を超えた絆を深めます。",
    image:
      "https://res.cloudinary.com/duh9jrbpp/image/upload/v1747184858/sports-day_bcmocf.jpg",
  },
  {
    id: "dodgeball-tournament",
    title: "ドッジボール大会",
    date: "6月",
    location: "高洲北小学校",
    description:
      "高学年から低学年、保護者や先生まで参加する人気行事イベント。2025年はお隣の高洲小学校と合同開催も計画されています。子ども VS 大人で白熱した試合を楽しみます。",
    image:
      "https://res.cloudinary.com/duh9jrbpp/image/upload/v1747184526/dodgeball_ch7dgs.jpg",
  },
  {
    id: "school-sleepover-camp",
    title: "学校に泊まろう（ガクトマ）",
    date: "7月",
    location: "高洲北小学校",
    description:
      "校庭での水風船や水鉄砲遊び、夜の肝試しなど、非日常の体験を通じて自助・共助の大切さを学ぶイベントです。",
    image: "/assets/gakutoma.jpeg",
  },
  {
    id: "music-festival",
    title: "音楽フェスティバル（Music MeeTing）",
    date: "10月",
    location: "高洲北小学校",
    description:
      "参加型のコンサート形式イベントで、生演奏とワークショップを通じて芸術体験を提供します。",
    image:
      "https://res.cloudinary.com/duh9jrbpp/image/upload/v1747184526/otofest_myog5o.jpg",
  },
];

export default function ActivitiesPage() {
  return (
    <div className="pt-24 pb-16 bg-bg-base">
      <div className="container-section">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-accent">活動内容</h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            高北おやじの会では、年間を通じてさまざまな活動を行っています。
            子どもたちと一緒に楽しみながら、貴重な経験を提供しています。
          </p>
        </div>

        <div className="space-y-16">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              id={activity.id}
              className="bg-bg-surface rounded-lg shadow-md overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div
                  className={`order-1 ${
                    index % 2 === 0 ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={activity.image}
                      alt={activity.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div
                  className={`p-6 order-2 ${
                    index % 2 === 0 ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h2 className="text-2xl font-bold mb-4">{activity.title}</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-accent mr-2 mt-0.5" />
                      <span>{activity.date}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-accent mr-2 mt-0.5" />
                      <span>{activity.location}</span>
                    </div>
                  </div>

                  <p className="text-text-muted mb-6">{activity.description}</p>

                  <Link
                    href="/contact"
                    className="inline-block bg-primary text-text-main font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    参加について問い合わせる
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-accent/10 rounded-lg p-6 md:p-8 inline-block">
            <h2 className="text-2xl font-bold mb-4 text-accent">
              活動に参加するには
            </h2>
            <p className="mb-4 text-text-muted">
              高北おやじの会の活動は、原則として会員のお子さんが参加できますが、
              一部のイベントは地域の子どもたちにも開放しています。
            </p>
            <p className="mb-6 text-text-muted">
              入会やイベント参加に関するお問い合わせは、下記からお願いします。
            </p>
            <Link href="/contact" className="btn-secondary">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
