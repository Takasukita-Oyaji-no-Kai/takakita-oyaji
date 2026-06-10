"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  image: string;
};

type BlogSectionProps = {
  posts: BlogPost[];
};

export default function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section id="blog" className="py-20 bg-bg-surface">
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title inline-block relative">
            最新のブログ投稿
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary"></span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-text-muted">
            高北おやじの会の最近の活動や今後の予定、お知らせなどをブログで発信しています。
          </p>
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-bg-base rounded-lg shadow">
            <p className="text-lg text-text-muted">現在、投稿はありません。</p>
            <p className="mt-2">最初の記事をお待ちください。</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="blog-card group"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-text-muted mb-3 space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-text-muted line-clamp-3">{post.excerpt}</p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Link href="/blog" className="btn-primary">
                すべての記事を読む
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}