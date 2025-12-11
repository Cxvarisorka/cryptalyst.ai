require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Section = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const User = require('../models/user.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCourses = async () => {
  try {
    await connectDB();

    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️ No admin user found, please create one first');
      process.exit(1);
    }

    // Clear existing courses
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Lesson.deleteMany({});

    console.log('🧹 Cleared existing courses');

    // ==================== CRYPTO BASICS COURSE (FREE) ====================
    const cryptoBasics = await Course.create({
      title: 'Cryptocurrency Basics',
      description: 'Learn the fundamentals of cryptocurrency, blockchain technology, and how digital currencies work.',
      category: 'crypto',
      difficulty: 'beginner',
      tier: 'free',
      isPublished: true,
      estimatedDuration: 120,
      createdBy: admin._id,
      order: 1,
      translations: new Map([
        ['ka', {
          title: 'კრიპტოვალუტის საფუძვლები',
          description: 'ისწავლეთ კრიპტოვალუტის, ბლოკჩეინ ტექნოლოგიისა და ციფრული ვალუტების მუშაობის საფუძვლები.'
        }]
      ])
    });

    // Section 1: Introduction
    const cryptoSection1 = await Section.create({
      courseId: cryptoBasics._id,
      title: 'Introduction to Cryptocurrency',
      description: 'What is cryptocurrency and why does it matter?',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'შესავალი კრიპტოვალუტაში',
          description: 'რა არის კრიპტოვალუტა და რატომ არის ის მნიშვნელოვანი?'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: cryptoSection1._id,
        courseId: cryptoBasics._id,
        title: 'What is Cryptocurrency?',
        content: `<h2>What is Cryptocurrency?</h2>
<p>Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. Unlike traditional currencies issued by governments (fiat currency), cryptocurrencies operate on decentralized networks based on blockchain technology.</p>
<h3>Key Features:</h3>
<ul>
<li><strong>Decentralized:</strong> No single authority controls the currency</li>
<li><strong>Transparent:</strong> All transactions are recorded on a public ledger</li>
<li><strong>Secure:</strong> Cryptography protects transactions</li>
<li><strong>Borderless:</strong> Can be sent anywhere in the world</li>
</ul>`,
        contentType: 'text',
        estimatedDuration: 10,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'რა არის კრიპტოვალუტა?',
            content: `<h2>რა არის კრიპტოვალუტა?</h2>
<p>კრიპტოვალუტა არის ციფრული ან ვირტუალური ვალუტის ფორმა, რომელიც იყენებს კრიპტოგრაფიას უსაფრთხოებისთვის. განსხვავებით ტრადიციული ვალუტებისგან, რომლებსაც ხელისუფლება გამოსცემს (ფიატი ვალუტა), კრიპტოვალუტები მუშაობენ დეცენტრალიზებულ ქსელებში ბლოკჩეინ ტექნოლოგიის საფუძველზე.</p>
<h3>ძირითადი მახასიათებლები:</h3>
<ul>
<li><strong>დეცენტრალიზებული:</strong> არცერთი ავტორიტეტი არ აკონტროლებს ვალუტას</li>
<li><strong>გამჭვირვალე:</strong> ყველა ტრანზაქცია ჩაიწერება საჯარო ლედჯერში</li>
<li><strong>უსაფრთხო:</strong> კრიპტოგრაფია იცავს ტრანზაქციებს</li>
<li><strong>უსაზღვრო:</strong> შეიძლება გაიგზავნოს მსოფლიოს ნებისმიერ წერტილში</li>
</ul>`
          }]
        ])
      },
      {
        sectionId: cryptoSection1._id,
        courseId: cryptoBasics._id,
        title: 'Understanding Blockchain',
        content: `<h2>Understanding Blockchain</h2>
<p>Blockchain is the underlying technology that powers most cryptocurrencies. Think of it as a digital ledger that records all transactions across a network of computers.</p>
<h3>How it Works:</h3>
<ol>
<li>Transactions are grouped into blocks</li>
<li>Each block is linked to the previous one (forming a chain)</li>
<li>The network validates each block through consensus</li>
<li>Once validated, the block is permanently added to the chain</li>
</ol>
<p>This creates an immutable record that cannot be altered without changing all subsequent blocks, making it extremely secure.</p>`,
        contentType: 'text',
        estimatedDuration: 15,
        order: 1,
        translations: new Map([
          ['ka', {
            title: 'ბლოკჩეინის გაგება',
            content: `<h2>ბლოკჩეინის გაგება</h2>
<p>ბლოკჩეინი არის ძირითადი ტექნოლოგია, რომელიც უზრუნველყოფს კრიპტოვალუტების უმეტესობას. დაიანახეთ ეს როგორც ციფრული ლედჯერი, რომელიც აღრიცხავს ყველა ტრანზაქციას კომპიუტერების ქსელში.</p>
<h3>როგორ მუშაობს:</h3>
<ol>
<li>ტრანზაქციები დაჯგუფებულია ბლოკებში</li>
<li>თითოეული ბლოკი დაკავშირებულია წინასთან (აყალიბებს ჯაჭვს)</li>
<li>ქსელი ადასტურებს თითოეულ ბლოკს კონსენსუსის მეშვეობით</li>
<li>მას შემდეგ რაც დასტურდება, ბლოკი მუდმივად ემატება ჯაჭვს</li>
</ol>
<p>ეს ქმნის უცვლელ ჩანაწერს, რომელიც ვერ შეიცვლება ყველა შემდგომი ბლოკის შეცვლის გარეშე, რაც მას უკიდურესად უსაფრთხოს ხდის.</p>`
          }]
        ])
      },
    ]);

    // Section 2: Getting Started
    const cryptoSection2 = await Section.create({
      courseId: cryptoBasics._id,
      title: 'Getting Started with Crypto',
      description: 'Learn how to buy, store, and secure your cryptocurrency',
      order: 1,
      translations: new Map([
        ['ka', {
          title: 'დაწყება კრიპტოთი',
          description: 'ისწავლეთ როგორ იყიდოთ, შეინახოთ და დაიცვათ თქვენი კრიპტოვალუტა'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: cryptoSection2._id,
        courseId: cryptoBasics._id,
        title: 'Quiz: Crypto Fundamentals',
        content: `<h2>Test Your Knowledge</h2>
<p>Let's see how well you understood the basics of cryptocurrency!</p>`,
        contentType: 'quiz',
        quiz: {
          questions: [
            {
              question: 'What technology underlies most cryptocurrencies?',
              options: ['Blockchain', 'Cloud Computing', 'Artificial Intelligence', 'Quantum Computing'],
              correctAnswer: 0,
              explanation: 'Blockchain is the distributed ledger technology that underlies most cryptocurrencies, providing security and transparency.',
            },
            {
              question: 'Which of the following is NOT a key feature of cryptocurrency?',
              options: ['Decentralized', 'Controlled by banks', 'Transparent', 'Secure'],
              correctAnswer: 1,
              explanation: 'Cryptocurrencies are decentralized and not controlled by banks or governments. This is one of their key distinguishing features.',
            },
          ],
        },
        estimatedDuration: 5,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'ქვიზი: კრიპტოს ფუნდამენტური საფუძვლები',
            content: `<h2>შეამოწმეთ თქვენი ცოდნა</h2>
<p>მოდით ვნახოთ რამდენად კარგად გაიგეთ კრიპტოვალუტის საფუძვლები!</p>`,
            quiz: {
              questions: [
                {
                  question: 'რომელი ტექნოლოგია დევს კრიპტოვალუტების უმეტესობის საფუძველში?',
                  options: ['ბლოკჩეინი', 'ღრუბლოვანი გამოთვლა', 'ხელოვნური ინტელექტი', 'კვანტური გამოთვლა'],
                  explanation: 'ბლოკჩეინი არის განაწილებული ლედჯერის ტექნოლოგია, რომელიც დევს კრიპტოვალუტების უმეტესობის საფუძველში, უზრუნველყოფს უსაფრთხოებას და გამჭვირვალობას.',
                },
                {
                  question: 'რომელი არ არის კრიპტოვალუტის ძირითადი მახასიათებელი?',
                  options: ['დეცენტრალიზებული', 'კონტროლდება ბანკების მიერ', 'გამჭვირვალე', 'უსაფრთხო'],
                  explanation: 'კრიპტოვალუტები დეცენტრალიზებულია და არ კონტროლდება ბანკების ან მთავრობების მიერ. ეს არის მათი ერთ-ერთი ძირითადი გამორჩეული მახასიათებელი.',
                },
              ],
            }
          }]
        ])
      },
    ]);

    // Update course totalLessons
    cryptoBasics.totalLessons = await Lesson.countDocuments({ courseId: cryptoBasics._id });
    await cryptoBasics.save();

    // ==================== STOCK MARKET BASICS (BASIC) ====================
    const stockBasics = await Course.create({
      title: 'Stock Market Fundamentals',
      description: 'Master the basics of stock market investing, including how to analyze companies and make informed investment decisions.',
      category: 'stocks',
      difficulty: 'beginner',
      tier: 'basic',
      isPublished: true,
      estimatedDuration: 90,
      createdBy: admin._id,
      order: 2,
      translations: new Map([
        ['ka', {
          title: 'საფონდო ბაზრის საფუძვლები',
          description: 'დაეუფლეთ საფონდო ბაზარზე ინვესტიციის საფუძვლებს, მათ შორის კომპანიების ანალიზს და ინფორმირებული საინვესტიციო გადაწყვეტილებების მიღებას.'
        }]
      ])
    });

    const stockSection1 = await Section.create({
      courseId: stockBasics._id,
      title: 'Introduction to Stocks',
      description: 'Understanding what stocks are and how the market works',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'შესავალი აქციებში',
          description: 'გაიგეთ რა არის აქციები და როგორ მუშაობს ბაზარი'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: stockSection1._id,
        courseId: stockBasics._id,
        title: 'What are Stocks?',
        content: `<h2>What are Stocks?</h2>
<p>Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner of that company.</p>
<h3>Types of Stocks:</h3>
<ul>
<li><strong>Common Stock:</strong> Voting rights and potential dividends</li>
<li><strong>Preferred Stock:</strong> Priority dividends but limited voting rights</li>
</ul>
<h3>Why Companies Issue Stock:</h3>
<p>Companies sell stock to raise capital for growth, expansion, or operations without taking on debt.</p>`,
        contentType: 'text',
        estimatedDuration: 10,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'რა არის აქციები?',
            content: `<h2>რა არის აქციები?</h2>
<p>აქციები წარმოადგენს საკუთრების წილებს კომპანიაში. როცა ყიდულობთ აქციას, თქვენ ხდებით იმ კომპანიის ნაწილობრივ მფლობელი.</p>
<h3>აქციების ტიპები:</h3>
<ul>
<li><strong>ჩვეულებრივი აქცია:</strong> ხმის უფლება და პოტენციური დივიდენდები</li>
<li><strong>პრივილეგირებული აქცია:</strong> პრიორიტეტული დივიდენდები, მაგრამ შეზღუდული ხმის უფლებები</li>
</ul>
<h3>რატომ გამოსცემენ კომპანიები აქციებს:</h3>
<p>კომპანიები ყიდიან აქციებს კაპიტალის მოსაპოვებლად ზრდისთვის, გაფართოებისთვის ან ოპერაციებისთვის ვალის გარეშე.</p>`
          }]
        ])
      },
      {
        sectionId: stockSection1._id,
        courseId: stockBasics._id,
        title: 'How the Stock Market Works',
        content: `<h2>How the Stock Market Works</h2>
<p>The stock market is where buyers and sellers trade shares of publicly traded companies.</p>
<h3>Key Concepts:</h3>
<ul>
<li><strong>Stock Exchange:</strong> Markets like NYSE, NASDAQ where stocks are traded</li>
<li><strong>Bid & Ask:</strong> The buying and selling prices</li>
<li><strong>Market Cap:</strong> Total value of a company's shares</li>
<li><strong>Volatility:</strong> How much a stock's price fluctuates</li>
</ul>`,
        contentType: 'text',
        estimatedDuration: 15,
        order: 1,
        translations: new Map([
          ['ka', {
            title: 'როგორ მუშაობს საფონდო ბაზარი',
            content: `<h2>როგორ მუშაობს საფონდო ბაზარი</h2>
<p>საფონდო ბაზარი არის ადგილი, სადაც მყიდველები და გამყიდველები ვაჭრობენ საჯარო კომპანიების აქციებით.</p>
<h3>ძირითადი კონცეფციები:</h3>
<ul>
<li><strong>საფონდო ბირჟა:</strong> ბაზრები როგორიცაა NYSE, NASDAQ სადაც ვაჭრობენ აქციებით</li>
<li><strong>შეთავაზება და მოთხოვნა:</strong> ყიდვისა და გაყიდვის ფასები</li>
<li><strong>საბაზრო კაპიტალიზაცია:</strong> კომპანიის აქციების მთლიანი ღირებულება</li>
<li><strong>არასტაბილურობა:</strong> რამდენად მერყეობს აქციის ფასი</li>
</ul>`
          }]
        ])
      },
    ]);

    stockBasics.totalLessons = await Lesson.countDocuments({ courseId: stockBasics._id });
    await stockBasics.save();

    // ==================== TECHNICAL ANALYSIS (PREMIUM) ====================
    const technicalAnalysis = await Course.create({
      title: 'Technical Analysis for Beginners',
      description: 'Learn how to read charts, identify patterns, and use technical indicators to make better trading decisions.',
      category: 'technical-analysis',
      difficulty: 'intermediate',
      tier: 'premium',
      isPublished: true,
      estimatedDuration: 180,
      createdBy: admin._id,
      order: 3,
      translations: new Map([
        ['ka', {
          title: 'ტექნიკური ანალიზი დამწყებთათვის',
          description: 'ისწავლეთ როგორ წაიკითხოთ გრაფიკები, ამოიცნოთ პატერნები და გამოიყენოთ ტექნიკური ინდიკატორები უკეთესი ტრეიდინგის გადაწყვეტილებებისთვის.'
        }]
      ])
    });

    const techSection1 = await Section.create({
      courseId: technicalAnalysis._id,
      title: 'Chart Basics',
      description: 'Understanding price charts and candlestick patterns',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'გრაფიკების საფუძვლები',
          description: 'ფასების გრაფიკებისა და სასანთლე პატერნების გაგება'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: techSection1._id,
        courseId: technicalAnalysis._id,
        title: 'Reading Candlestick Charts',
        content: `<h2>Reading Candlestick Charts</h2>
<p>Candlestick charts are one of the most popular ways to visualize price movements in trading.</p>
<h3>Anatomy of a Candlestick:</h3>
<ul>
<li><strong>Body:</strong> The range between open and close prices</li>
<li><strong>Wicks/Shadows:</strong> The highest and lowest prices during the period</li>
<li><strong>Green/White:</strong> Close price higher than open (bullish)</li>
<li><strong>Red/Black:</strong> Close price lower than open (bearish)</li>
</ul>
<h3>Common Patterns:</h3>
<p>Doji, Hammer, Engulfing, and more patterns can signal potential price reversals or continuations.</p>`,
        contentType: 'text',
        estimatedDuration: 20,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'სასანთლე გრაფიკების წაკითხვა',
            content: `<h2>სასანთლე გრაფიკების წაკითხვა</h2>
<p>სასანთლე გრაფიკები არის ერთ-ერთი ყველაზე პოპულარული გზა ფასების მოძრაობის ვიზუალიზაციისთვის ტრეიდინგში.</p>
<h3>სასანთლის ანატომია:</h3>
<ul>
<li><strong>სხეული:</strong> დიაპაზონი გახსნისა და დახურვის ფასებს შორის</li>
<li><strong>ფითილები/ჩრდილები:</strong> უმაღლესი და უდაბლესი ფასები პერიოდის განმავლობაში</li>
<li><strong>მწვანე/თეთრი:</strong> დახურვის ფასი უმაღლესია გახსნაზე (ბულიში)</li>
<li><strong>წითელი/შავი:</strong> დახურვის ფასი დაბალია გახსნაზე (ბეარიში)</li>
</ul>
<h3>გავრცელებული პატერნები:</h3>
<p>დოჯი, ჩაქუჩი, შთანთქმა და სხვა პატერნები შეიძლება მიუთითებდეს ფასის პოტენციურ შებრუნებაზე ან გაგრძელებაზე.</p>`
          }]
        ])
      },
    ]);

    technicalAnalysis.totalLessons = await Lesson.countDocuments({ courseId: technicalAnalysis._id });
    await technicalAnalysis.save();

    // ==================== TRADING FUNDAMENTALS (FREE) ====================
    const tradingFundamentals = await Course.create({
      title: 'Introduction to Trading',
      description: 'Get started with trading basics, understand different trading styles, and learn essential trading terminology.',
      category: 'trading',
      difficulty: 'beginner',
      tier: 'free',
      isPublished: true,
      estimatedDuration: 100,
      createdBy: admin._id,
      order: 4,
      translations: new Map([
        ['ka', {
          title: 'შესავალი ტრეიდინგში',
          description: 'დაიწყეთ ტრეიდინგის საფუძვლებით, გაიგეთ სხვადასხვა ტრეიდინგის სტილები და ისწავლეთ აუცილებელი ტრეიდინგის ტერმინოლოგია.'
        }]
      ])
    });

    const tradingSection1 = await Section.create({
      courseId: tradingFundamentals._id,
      title: 'Trading Basics',
      description: 'Understanding the fundamentals of trading',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'ტრეიდინგის საფუძვლები',
          description: 'ტრეიდინგის ფუნდამენტური საფუძვლების გაგება'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: tradingSection1._id,
        courseId: tradingFundamentals._id,
        title: 'What is Trading?',
        content: `<h2>What is Trading?</h2>
<p>Trading involves buying and selling financial instruments like stocks, cryptocurrencies, forex, or commodities with the goal of making a profit.</p>
<h3>Types of Trading:</h3>
<ul>
<li><strong>Day Trading:</strong> Opening and closing positions within the same day</li>
<li><strong>Swing Trading:</strong> Holding positions for several days or weeks</li>
<li><strong>Position Trading:</strong> Long-term trading over months or years</li>
<li><strong>Scalping:</strong> Making many small profits on minor price changes</li>
</ul>`,
        contentType: 'text',
        estimatedDuration: 15,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'რა არის ტრეიდინგი?',
            content: `<h2>რა არის ტრეიდინგი?</h2>
<p>ტრეიდინგი გულისხმობს ფინანსური ინსტრუმენტების ყიდვა-გაყიდვას, როგორიცაა აქციები, კრიპტოვალუტები, ფორექსი ან საქონელი მოგების მიზნით.</p>
<h3>ტრეიდინგის ტიპები:</h3>
<ul>
<li><strong>დღის ტრეიდინგი:</strong> პოზიციების გახსნა და დახურვა ერთი დღის განმავლობაში</li>
<li><strong>სვინგ ტრეიდინგი:</strong> პოზიციების შენარჩუნება რამდენიმე დღის ან კვირის განმავლობაში</li>
<li><strong>პოზიციური ტრეიდინგი:</strong> გრძელვადიანი ტრეიდინგი თვეების ან წლების განმავლობაში</li>
<li><strong>სკალპინგი:</strong> მრავალი მცირე მოგების მიღება უმნიშვნელო ფასის ცვლილებებზე</li>
</ul>`
          }]
        ])
      },
    ]);

    tradingFundamentals.totalLessons = await Lesson.countDocuments({ courseId: tradingFundamentals._id });
    await tradingFundamentals.save();

    // ==================== PORTFOLIO MANAGEMENT (BASIC) ====================
    const portfolioManagement = await Course.create({
      title: 'Portfolio Management Strategies',
      description: 'Learn how to build and manage a diversified investment portfolio for long-term wealth creation.',
      category: 'fundamentals',
      difficulty: 'intermediate',
      tier: 'basic',
      isPublished: true,
      estimatedDuration: 150,
      createdBy: admin._id,
      order: 5,
      translations: new Map([
        ['ka', {
          title: 'პორტფელის მართვის სტრატეგიები',
          description: 'ისწავლეთ როგორ ააშენოთ და მართოთ დივერსიფიცირებული საინვესტიციო პორტფელი გრძელვადიანი სიმდიდრის შესაქმნელად.'
        }]
      ])
    });

    const portfolioSection1 = await Section.create({
      courseId: portfolioManagement._id,
      title: 'Portfolio Basics',
      description: 'Understanding portfolio construction and diversification',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'პორტფელის საფუძვლები',
          description: 'პორტფელის კონსტრუქციისა და დივერსიფიკაციის გაგება'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: portfolioSection1._id,
        courseId: portfolioManagement._id,
        title: 'Building a Diversified Portfolio',
        content: `<h2>Building a Diversified Portfolio</h2>
<p>Diversification is the practice of spreading your investments across different assets to reduce risk.</p>
<h3>Key Principles:</h3>
<ul>
<li><strong>Asset Allocation:</strong> Dividing investments among different asset categories</li>
<li><strong>Risk Management:</strong> Balancing risk and reward</li>
<li><strong>Rebalancing:</strong> Periodically adjusting your portfolio</li>
<li><strong>Time Horizon:</strong> Aligning investments with your goals</li>
</ul>`,
        contentType: 'text',
        estimatedDuration: 20,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'დივერსიფიცირებული პორტფელის აგება',
            content: `<h2>დივერსიფიცირებული პორტფელის აგება</h2>
<p>დივერსიფიკაცია არის პრაქტიკა, როცა თქვენს ინვესტიციებს ანაწილებთ სხვადასხვა აქტივებზე რისკის შესამცირებლად.</p>
<h3>ძირითადი პრინციპები:</h3>
<ul>
<li><strong>აქტივების განაწილება:</strong> ინვესტიციების გაყოფა სხვადასხვა აქტივების კატეგორიებზე</li>
<li><strong>რისკების მართვა:</strong> რისკისა და ანაზღაურების დაბალანსება</li>
<li><strong>რებალანსირება:</strong> თქვენი პორტფელის პერიოდული კორექტირება</li>
<li><strong>დროის ჰორიზონტი:</strong> ინვესტიციების შესაბამისობა თქვენს მიზნებთან</li>
</ul>`
          }]
        ])
      },
    ]);

    portfolioManagement.totalLessons = await Lesson.countDocuments({ courseId: portfolioManagement._id });
    await portfolioManagement.save();

    // ==================== ADVANCED TRADING STRATEGIES (PREMIUM) ====================
    const advancedTrading = await Course.create({
      title: 'Advanced Trading Strategies',
      description: 'Master advanced trading techniques including options, futures, and algorithmic trading strategies.',
      category: 'trading',
      difficulty: 'advanced',
      tier: 'premium',
      isPublished: true,
      estimatedDuration: 240,
      createdBy: admin._id,
      order: 6,
      translations: new Map([
        ['ka', {
          title: 'გაფართოებული ტრეიდინგის სტრატეგიები',
          description: 'დაეუფლეთ გაფართოებული ტრეიდინგის ტექნიკას, მათ შორის ოფციონებს, ფიუჩერსებს და ალგორითმულ ტრეიდინგის სტრატეგიებს.'
        }]
      ])
    });

    const advancedSection1 = await Section.create({
      courseId: advancedTrading._id,
      title: 'Advanced Concepts',
      description: 'Complex trading strategies for experienced traders',
      order: 0,
      translations: new Map([
        ['ka', {
          title: 'გაფართოებული კონცეფციები',
          description: 'კომპლექსური ტრეიდინგის სტრატეგიები გამოცდილი ტრეიდერებისთვის'
        }]
      ])
    });

    await Lesson.create([
      {
        sectionId: advancedSection1._id,
        courseId: advancedTrading._id,
        title: 'Options Trading Basics',
        content: `<h2>Options Trading Basics</h2>
<p>Options are contracts that give you the right, but not the obligation, to buy or sell an asset at a predetermined price.</p>
<h3>Types of Options:</h3>
<ul>
<li><strong>Call Options:</strong> Right to buy at a specific price</li>
<li><strong>Put Options:</strong> Right to sell at a specific price</li>
<li><strong>Covered Calls:</strong> Selling calls on assets you own</li>
<li><strong>Protective Puts:</strong> Buying puts to protect against losses</li>
</ul>
<h3>Advanced Strategies:</h3>
<p>Iron condors, butterflies, straddles, and more complex multi-leg strategies for various market conditions.</p>`,
        contentType: 'text',
        estimatedDuration: 30,
        order: 0,
        translations: new Map([
          ['ka', {
            title: 'ოფციონებით ტრეიდინგის საფუძვლები',
            content: `<h2>ოფციონებით ტრეიდინგის საფუძვლები</h2>
<p>ოფციონები არის კონტრაქტები, რომლებიც გაძლევთ უფლებას, მაგრამ არა ვალდებულებას, იყიდოთ ან გაყიდოთ აქტივი წინასწარ განსაზღვრულ ფასად.</p>
<h3>ოფციონების ტიპები:</h3>
<ul>
<li><strong>ქოლ ოფციონები:</strong> უფლება იყიდოთ კონკრეტულ ფასად</li>
<li><strong>პუთ ოფციონები:</strong> უფლება გაყიდოთ კონკრეტულ ფასად</li>
<li><strong>დაფარული ქოლები:</strong> ქოლების გაყიდვა თქვენს საკუთრებაში არსებულ აქტივებზე</li>
<li><strong>დამცავი პუთები:</strong> პუთების ყიდვა ზარალისგან დასაცავად</li>
</ul>
<h3>გაფართოებული სტრატეგიები:</h3>
<p>რკინის კონდორები, პეპლები, სტრედლები და სხვა კომპლექსური მრავალფეხა სტრატეგიები სხვადასხვა საბაზრო პირობებისთვის.</p>`
          }]
        ])
      },
    ]);

    advancedTrading.totalLessons = await Lesson.countDocuments({ courseId: advancedTrading._id });
    await advancedTrading.save();

    console.log('✅ Successfully seeded courses:');
    console.log(`   - ${cryptoBasics.title} (FREE): ${cryptoBasics.totalLessons} lessons`);
    console.log(`   - ${stockBasics.title} (BASIC): ${stockBasics.totalLessons} lessons`);
    console.log(`   - ${technicalAnalysis.title} (PREMIUM): ${technicalAnalysis.totalLessons} lessons`);
    console.log(`   - ${tradingFundamentals.title} (FREE): ${tradingFundamentals.totalLessons} lessons`);
    console.log(`   - ${portfolioManagement.title} (BASIC): ${portfolioManagement.totalLessons} lessons`);
    console.log(`   - ${advancedTrading.title} (PREMIUM): ${advancedTrading.totalLessons} lessons`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
