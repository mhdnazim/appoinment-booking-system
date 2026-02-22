# Express TypeScript Server

A production-ready Express.js server setup with TypeScript, following industry-standard folder structure with dot notation naming convention.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:4200`

## 📁 Project Structure

```
structure/
├── src/
│   ├── config/
│   │   └── env.config.ts      # Environment configuration
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── .gitignore
├── nodemon.json               # Nodemon configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run type-check` - Type check without emitting files

## 📝 API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## 🔧 Configuration

Server port and environment can be configured in `.env` file:
```
PORT=4200
NODE_ENV=development
```

## 📦 Dependencies

### Production
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Security middleware
- `morgan` - HTTP request logger
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server with auto-reload
- `@types/*` - TypeScript type definitions

## 🎯 Next Steps

To extend this project, you can add:

- **Routes**: `src/routes/user.routes.ts`
- **Controllers**: `src/controllers/user.controller.ts`
- **Services**: `src/services/user.service.ts`
- **Models**: `src/models/user.model.ts`
- **Middleware**: `src/middleware/auth.middleware.ts`
- **Validations**: `src/validations/user.validation.ts`

## 📄 License

ISC

