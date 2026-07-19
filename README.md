# SpendWise 💸
> AI-powered personal expense tracking mobile app

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 📱 About
SpendWise is a full-stack mobile expense tracking app with AI features. Track your income and expenses, set monthly budgets, and get AI-powered insights about your spending habits.

## ✨ Features
- 🔐 **Secure Authentication** — JWT-based login and register
- 💸 **Expense Tracking** — Add, view, and delete income/expenses
- 🎯 **Budget Management** — Set monthly budgets by category
- 📊 **Analytics** — 7-day trend line chart and spending pie chart
- 🤖 **AI Chatbot** — Ask questions about your spending (powered by Gemini)
- 🏠 **Dashboard** — Balance overview with This Month / All Time toggle
- 👤 **Profile** — View account info and logout

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB Atlas | Database |
| Redis (Upstash) | Caching |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Groq AI (Llama3) | AI features |

### Frontend
| Technology | Purpose |
|---|---|
| React Native | Mobile app |
| Expo | Development platform |
| Axios | API calls |
| React Navigation | Screen navigation |
| expo-secure-store | Token storage |
| react-native-chart-kit | Charts |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Expo Go app on your phone
- MongoDB Atlas account
- Upstash Redis account

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_upstash_redis_url
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

Run backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Update `src/constants/api.js`:
```js
export const API_URL = 'https://your-railway-url.up.railway.app';
```

Run frontend:
```bash
npx expo start
```

Scan QR code with Expo Go on your phone.

## 📁 Project Structure

```
spendwise/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── constants/
    │   ├── context/
    │   ├── hooks/
    │   └── screens/
    └── App.js
```
## 🌐 Deployment
- **Backend** — Deployed on Railway
- **Database** — MongoDB Atlas
- **Cache** — Upstash Redis

## 📸 Screenshots
*Coming soon*

## 🔮 Future Features
- [ ] Push notifications for budget alerts
- [ ] Receipt scanning with AI
- [ ] Export expenses to PDF
- [ ] Multiple currency support
- [ ] Dark mode

## 👨‍💻 Author
**Vansu** — [@vansu21](https://github.com/vansu21)

## 📄 License
MIT License
