# backend\scripts\newsfeed.py
import feedparser
import json
from transformers import pipeline

# Instantiate pipelines globally to avoid repeated initialization delays
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
sentiment_analyzer = pipeline("sentiment-analysis")
headline_generator = pipeline("text-generation", model="gpt2")

def get_air_quality_news():
    rss_url = "https://news.google.com/rss/search?q=air+quality+AQI+USA&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(rss_url)
    articles = []
    for entry in feed.entries[:5]:  # top 5 articles
        title = entry.title
        link = entry.link
        description = entry.summary if "summary" in entry else ""
        articles.append({"title": title, "description": description, "link": link})
    return articles

def summarize_text(text):
    summary = summarizer(text, max_length=50, min_length=25, do_sample=True)[0]['summary_text']
    return summary

def analyze_sentiment(text):
    result = sentiment_analyzer(text)[0]
    return f"{result['label']} (Confidence: {result['score']:.2f})"

def generate_headline(original_title):
    new_headline = headline_generator(original_title, max_new_tokens=50, num_return_sequences=1)[0]["generated_text"]
    return new_headline.strip()

def process_articles():
    articles = get_air_quality_news()
    processed = []
    for article in articles:
        text_to_summarize = article['description'] if article['description'] else article['title']
        summary = summarize_text(text_to_summarize)
        sentiment = analyze_sentiment(summary)
        clickbait_headline = generate_headline(article['title'])
        processed.append({
            "original_title": article['title'],
            "link": article['link'],
            "summary": summary,
            "sentiment": sentiment,
            "clickbait_headline": clickbait_headline
        })
    return processed

if __name__ == "__main__":
    output = {"articles": process_articles()}
    print(json.dumps(output))
