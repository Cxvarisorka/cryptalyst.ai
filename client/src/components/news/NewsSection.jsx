import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Newspaper, ExternalLink, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NewsSection({ news, loading }) {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t("news.justNow") || "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return t("news.yesterday") || "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            {t("news.title") || "Latest News"}
          </CardTitle>
          <CardDescription>{t("news.description") || "Recent news and updates"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            {t("news.title") || "Latest News"}
          </CardTitle>
          <CardDescription>{t("news.description") || "Recent news and updates"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("news.noNews") || "No news available at the moment"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {t("news.title") || "Latest News"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("news.description") || "Recent news and updates"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-border/40 rounded-lg hover:bg-muted/30 hover:border-primary/40 transition-all duration-300">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs text-muted-foreground">
                    {article.source && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.source}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-primary">
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">{t("news.readMore") || "Read more"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
