# Free AI API Cost Calculator

A free, open-source tool to calculate and compare AI API costs across 10+ providers — including OpenAI GPT-5, Anthropic Claude 4, Google Gemini 3, xAI Grok-2, Meta Llama, Mistral, Cohere, and more.

🌐 **Live App**: https://chatslm.com/

## Features

- 📊 **Real-time cost calculation** — Input tokens, output tokens, number of requests
- 📅 **Date range picker** — Calculate costs for any period
- 🏆 **Provider comparison table** — Side-by-side cost comparison of 30+ models
- 💡 **Optimization suggestions** — Tips to save on caching & batch APIs
- 📈 **12-month cost projection chart**
- 📄 **PDF & CSV export**
- 🔗 **Shareable links** — Share your exact configuration
- 💾 **Save calculations** locally
- 🎯 **Quick presets** — Chatbot, Content, Support, Code use cases
- 🤖 **2026 Models** — All latest models with accurate pricing

## Supported AI Providers

| Provider | Models |
|---|---|
| OpenAI | GPT-5.2 Pro, GPT-5.2, GPT-5 mini, GPT-5 nano, GPT-4o, GPT-4o Mini |
| Anthropic | Claude 4.6 Opus, Claude 4.5 Sonnet, Claude 4.5 Haiku, Claude 3.5 Sonnet |
| Google | Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Flash, Gemini 1.5 Pro |
| xAI | Grok-2, Grok-1.5 |
| Meta | Llama 3.1 405B, Llama 3 70B, Llama 3 8B |
| Mistral | Mistral Large 2, Mistral Large, Mistral Medium, Mistral Small |
| Cohere | Command R+, Command R, Command |
| Perplexity | Sonar Huge Online, Sonar Large Online |
| Together AI | Llama 3 70B Turbo, Mixtral 8x22B |
| Groq | Llama 3 70B, Mixtral 8x7B |

## Run Locally

```bash
# With Docker
docker compose up -d
# Open http://localhost:8080

# With Kubernetes (Docker Desktop)
kubectl apply -f k8s.yaml
# Open http://localhost:30080
```

## License

MIT — Free to use and modify.

---
Made with ❤️ by [Jagadeesh Pamidi](mailto:jagadeeshpamidi03@gmail.com)