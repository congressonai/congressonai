<div align="center">
  <img src="https://i.imgur.com/DWFSLEe.png" alt="congressonai" width="30%"/>
</div>
<hr>

<div align="center" style="line-height: 1;">
  <a href="https://congresson.ai" target="_blank" style="margin: 2px;">
    <img alt="Website" src="https://img.shields.io/badge/🌐%20Website-congresson.ai-536af5?color=536af5&logoColor=white"/>
  </a>
  <a href="https://twitter.com/congressonai" target="_blank" style="margin: 2px;">
    <img alt="Twitter" src="https://img.shields.io/badge/Twitter-congressonai-white?logo=x&logoColor=white"/>
  </a>
</div>

# 🐱 CongressOn.AI

> 🐾 Guardian of Democracy | 📜 Bill Whisperer | 🤖 AI-Powered Analyst

CongressOn.AI is an innovative platform that makes congressional legislation accessible and understandable through the power of AI. Our mascot, a wise and vigilant cat, serves as your guide through the complex world of legislative documents.

<div align="center">
  <img src="https://i.imgur.com/H4EUWIE.png" alt="congressonai" width="100%"/>
</div>

## 🌟 Features

- **Real-time Bill Tracking**: Stay updated with the latest congressional bills and their statuses
- **AI-Powered Analysis**: Get instant, plain-English explanations of complex legislation
- **Smart Search**: Find relevant bills using natural language queries
- **Interactive Chat**: Ask questions about any bill and get informed responses
- **PDF Access**: View and download original bill documents
- **Trending Bills**: Keep track of the most discussed legislation

## 🛠 Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: Grok AI for natural language processing
- **Vector Database**: Pinecone for semantic search
- **Infrastructure**: Docker, Nginx

## 🚀 Getting Started

1. Clone the repository
2. Set up environment variables:
   ```
   MONGO_URL=your_mongodb_url
   GROK_API_KEY=your_grok_api_key
   CONGRESS_API_KEY=your_congress_api_key
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## 🔍 How It Works

1. **Bill Collection**: Our system continuously monitors and fetches the latest bills from Congress.gov
2. **Vectorization**: Bills are processed and stored in a vector database for semantic search
3. **AI Analysis**: When you ask a question, our AI:
   - Finds relevant sections in the bills
   - Analyzes the content
   - Provides clear, accurate responses

## 🤝 Contributing

We welcome contributions! Whether it's:

- Improving documentation
- Adding new features
- Reporting bugs
- Suggesting enhancements

## 📱 Connect With Us

- [Twitter](https://x.com/congressonai)
- [Telegram](https://t.me/congressai)
- [GitHub](https://github.com/congressonai/congressonai)

## 🔒 Security

The platform uses secure API endpoints and follows best practices for data handling. All bill data is sourced directly from official congressional sources.

## 📄 License

MIT License - feel free to use and modify the code as needed.

---

Made with 💜 by the CongressOn.AI team
