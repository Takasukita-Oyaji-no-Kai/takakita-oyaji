import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getPostData,
  getSortedPostsData,
  formatDate,
  type BlogPost,
} from "@/lib/utils";
import { CalendarIcon, User, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const posts = await getSortedPostsData();
  // `output: "export"` requires every dynamic route to pre-render at least one
  // path. When there are no posts yet, emit a placeholder slug so the build
  // succeeds; it renders the not-found page and is dropped once real posts exist.
  if (posts.length === 0) {
    return [{ slug: "no-posts" }];
  }
  return posts.map((post: BlogPost) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPostData((await params).slug);

  if (!post) {
    return {
      title: "ブログ記事が見つかりません",
    };
  }

  return {
    title: `${post.title} | 高北おやじの会`,
    description: post.excerpt,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getPostData((await params).slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16 bg-bg-base">
      <div className="container-section">
        <article className="max-w-4xl mx-auto bg-bg-surface rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-6 md:p-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-accent hover:text-accent/80 mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>ブログ一覧に戻る</span>
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-main">
              {post.title}
            </h1>

            <div className="flex items-center text-sm text-text-muted mb-8 space-x-4">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                <span>{post.author}</span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none prose-headings:font-heading prose-p:text-text-main prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-md prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-text-main prose-strong:font-semibold prose-blockquote:border-l-accent prose-blockquote:bg-bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-pre:bg-bg-muted prose-pre:text-text-main prose-code:text-accent prose-code:bg-bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
