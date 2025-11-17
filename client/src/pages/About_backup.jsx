import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <FadeIn className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            About <GradientText>Cryptalyst.ai</GradientText>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Empowering cryptocurrency traders with AI-driven insights and analytics
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <FadeIn delay={0.1}>
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-slate-100">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 leading-relaxed">
                  Cryptalyst.ai is dedicated to democratizing access to professional-grade cryptocurrency
                  analysis tools. We believe that everyone should have access to the same powerful AI-driven
                  insights that institutional investors use to make informed trading decisions.
                </p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-slate-100">Our Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 leading-relaxed">
                  Our platform leverages cutting-edge machine learning algorithms and natural language
                  processing to analyze market trends, news sentiment, and trading patterns. We process
                  millions of data points in real-time to provide you with actionable insights.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.3}>
          <Card className="bg-slate-900/50 border-slate-800 mb-8">
            <CardHeader>
              <CardTitle className="text-slate-100">Key Features</CardTitle>
              <CardDescription>What makes Cryptalyst.ai unique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-100 mb-2">AI-Powered Analysis</h3>
                  <p className="text-slate-400">
                    Advanced algorithms that learn from market patterns to provide predictive insights
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-2">Real-Time Data</h3>
                  <p className="text-slate-400">
                    Live market data and instant alerts for significant market movements
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-2">Portfolio Tracking</h3>
                  <p className="text-slate-400">
                    Comprehensive portfolio management with performance analytics and optimization
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-2">Sentiment Analysis</h3>
                  <p className="text-slate-400">
                    Monitor social media and news sentiment to gauge market psychology
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4} className="text-center">
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Start Analyzing Now
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
