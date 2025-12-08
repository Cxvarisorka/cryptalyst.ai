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

    // ==================== CRYPTO BASICS COURSE ====================
    const cryptoBasics = await Course.create({
      title: 'Cryptocurrency Basics',
      description: 'Learn the fundamentals of cryptocurrency, blockchain technology, and how digital currencies work.',
      category: 'crypto',
      difficulty: 'beginner',
      isPublished: true,
      estimatedDuration: 120,
      createdBy: admin._id,
      order: 1,
    });

    // Section 1: Introduction
    const cryptoSection1 = await Section.create({
      courseId: cryptoBasics._id,
      title: 'Introduction to Cryptocurrency',
      description: 'What is cryptocurrency and why does it matter?',
      order: 0,
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
      },
    ]);

    // Section 2: Getting Started
    const cryptoSection2 = await Section.create({
      courseId: cryptoBasics._id,
      title: 'Getting Started with Crypto',
      description: 'Learn how to buy, store, and secure your cryptocurrency',
      order: 1,
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
      },
    ]);

    // Update course totalLessons
    cryptoBasics.totalLessons = await Lesson.countDocuments({ courseId: cryptoBasics._id });
    await cryptoBasics.save();

    // ==================== STOCK MARKET BASICS ====================
    const stockBasics = await Course.create({
      title: 'Stock Market Fundamentals',
      description: 'Master the basics of stock market investing, including how to analyze companies and make informed investment decisions.',
      category: 'stocks',
      difficulty: 'beginner',
      isPublished: true,
      estimatedDuration: 90,
      createdBy: admin._id,
      order: 2,
    });

    const stockSection1 = await Section.create({
      courseId: stockBasics._id,
      title: 'Introduction to Stocks',
      description: 'Understanding what stocks are and how the market works',
      order: 0,
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
      },
    ]);

    stockBasics.totalLessons = await Lesson.countDocuments({ courseId: stockBasics._id });
    await stockBasics.save();

    // ==================== TECHNICAL ANALYSIS ====================
    const technicalAnalysis = await Course.create({
      title: 'Technical Analysis for Beginners',
      description: 'Learn how to read charts, identify patterns, and use technical indicators to make better trading decisions.',
      category: 'technical-analysis',
      difficulty: 'intermediate',
      isPublished: true,
      estimatedDuration: 180,
      createdBy: admin._id,
      order: 3,
    });

    const techSection1 = await Section.create({
      courseId: technicalAnalysis._id,
      title: 'Chart Basics',
      description: 'Understanding price charts and candlestick patterns',
      order: 0,
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
      },
    ]);

    technicalAnalysis.totalLessons = await Lesson.countDocuments({ courseId: technicalAnalysis._id });
    await technicalAnalysis.save();

    console.log('✅ Successfully seeded courses:');
    console.log(`   - ${cryptoBasics.title}: ${cryptoBasics.totalLessons} lessons`);
    console.log(`   - ${stockBasics.title}: ${stockBasics.totalLessons} lessons`);
    console.log(`   - ${technicalAnalysis.title}: ${technicalAnalysis.totalLessons} lessons`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
