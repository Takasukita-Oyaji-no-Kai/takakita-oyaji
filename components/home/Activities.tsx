"use client";

import { motion } from "framer-motion";
import { Calendar, Flame, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const activities = [
  {
    title: "運動会",
    description:
      "親子や地域の参加者がチームに分かれて競技を楽しむ運動会です。かけっこ、玉入れ、綱引きなど多彩な種目を通して、チームワークや体力づくりを促進しながら、世代を超えた絆を深めます。",
    image:
      "https://res.cloudinary.com/duh9jrbpp/image/upload/v1747184858/sports-day_bcmocf.jpg",
    icon: <Users className="h-6 w-6" />,
    date: "5月",
  },
  {
    title: "ドッジボール大会",
    description:
      "高学年から低学年、保護者や先生まで参加する人気行事イベント。2025年はお隣の高洲小学校と合同開催も計画されています。子ども VS 大人で白熱した試合を楽しみます。",
    image:
      "https://res.cloudinary.com/duh9jrbpp/image/upload/v1747184526/dodgeball_ch7dgs.jpg",
    icon: <Flame className="h-6 w-6" />,
    date: "6月",
  },
  {
    title: "学校に泊まろう（ガクトマ）",
    description:
      "校庭での水風船や水鉄砲遊び、夜の肝試しなど、非日常の体験を通じて自助・共助の大切さを学ぶイベントです。",
    image: "/hero.jpeg",
    icon: <Calendar className="h-6 w-6" />,
    date: "7月",
  },
];

export default function Activities() {
  return (
    <section id="activities" className="py-20 bg-bg-base">
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title inline-block relative">
            主な活動内容
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary"></span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-text-muted">
            高北おやじの会では、季節ごとにさまざまなイベントを企画・運営しています。
            父親と子どもが一緒に楽しめる活動を通じて、絆を深める機会を提供しています。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card group"
            >
              <div className="relative h-60 overflow-hidden">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-accent rounded-full p-2 inline-block mb-2">
                    {activity.icon}
                  </div>
                  <p className="text-sm font-medium">{activity.date}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                <p className="text-text-muted mb-4">{activity.description}</p>
                <Link
                  href={`/activities#${activity.title}`}
                  className="text-accent font-medium hover:underline inline-flex items-center"
                >
                  詳細を見る
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/activities" className="btn-primary">
            すべての活動を見る
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
