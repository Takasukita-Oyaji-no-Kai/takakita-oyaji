import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 bg-bg-base">
      <div className="container-section">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-accent">
            私たちについて
          </h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            高洲北小学校に通う児童のおやじからなるゆるい集まりです。平成22年（2010年）に設立されました。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="relative rounded-lg overflow-hidden shadow-xl h-80 lg:h-auto">
            <Image
              src="https://res.cloudinary.com/duh9jrbpp/image/upload/v1747185386/oyaji2_lu5huo.jpg"
              alt="高北おやじの会のメンバー"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-accent">
              おやじの会とは
            </h2>
            <p className="mb-4 text-text-muted">
              多くの子供たちと触れ合いながら高北のイベント活動を下支えすることで、おやじ同士の絆が広がり、子供たちの健全育成に繋がることを期待しています。
            </p>
            <p className="mb-4 text-text-muted">
              同時におやじたち自身もしっかり楽しむことができる会です。おやじたちのやりたいこと（子供たちが喜ぶこと）をどんどん提案いただき、実現することも可能です。
              これまでにスキー、釣り、BBQなどの実績もあります。
            </p>
            <p className="text-text-muted">
              常に「できる時に、できることを楽しむ！」をモットーにしていますので、各々のご都合を優先してください。
              いつでも参加することができます。
            </p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg p-8 shadow-md mb-16">
          <h2 className="text-2xl font-bold mb-6 text-accent text-center">
            活動理念
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">子どもたちとの触れ合い</h3>
              <p className="text-text-muted">
                イベント活動を通じて、子どもたちと楽しく交流し、健全な成長をサポートします。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">おやじ同士の絆</h3>
              <p className="text-text-muted">
                活動を通じておやじ同士の交流を深め、互いに支え合う関係を築きます。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-accent text-center">
            入会について
          </h2>

          <div className="max-w-2xl mx-auto">
            <p className="mb-4 text-center text-text-muted">
              当HPで過去の活動の様子をご覧いただけます。ご入会いただきますと、おやじの会の連絡メールが届くようになります。
              勿論、入会費用はかかりません。
            </p>

            <div className="text-center">
              <div className="inline-block bg-accent text-white px-6 py-4 rounded-lg">
                <p className="font-bold">連絡先</p>
                <p className="mb-2">
                  <a
                    href="mailto:takasukitaoyajinokai@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center"
                  >
                    <span>takasukitaoyajinokai@gmail.com</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
