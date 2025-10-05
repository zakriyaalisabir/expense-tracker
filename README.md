# Expense Tracker v1.0.0

**Personal Finance Management System**

A comprehensive expense tracker with multi-currency support, budgeting, goal tracking, and interactive data visualizations.

## 📋 Table of Contents
- [License](#license)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Application Architecture](#application-architecture)
- [Data Flow](#data-flow)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 📄 License

**PRIVATE SOFTWARE - PERSONAL USE ONLY**

This software is proprietary and confidential. Unauthorized copying, distribution, modification, public display, or public performance of this software is strictly prohibited and may be unlawful. This software is intended for personal use only by the authorized user.

**WARNING**: Any unauthorized use, reproduction, or distribution of this software without explicit written permission from the owner may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.

© 2025 - All Rights Reserved

## 🎯 Overview

Expense Tracker v2.0 is a modern, full-stack personal finance management application built with Next.js 14 and Supabase. It provides comprehensive expense tracking, budgeting, goal management, and financial analytics with beautiful data visualizations.

### Key Capabilities
- **Multi-currency Support**: Track expenses in multiple currencies with real-time conversion
- **Smart Budgeting**: Set and monitor monthly budgets by category
- **Goal Tracking**: Create and track financial goals with progress visualization
- **Interactive Charts**: D3.js powered visualizations for financial insights
- **Account Management**: Manage multiple accounts (Cash, Bank, Credit, E-wallet)
- **Data Export**: Export transactions and reports in CSV format
- **Cloud Sync**: Real-time data synchronization with Supabase backend

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI) 6** - React component library
- **D3.js 7** - Data visualization library
- **Zustand 4** - State management
- **date-fns** - Date manipulation utilities

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Real-time)
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Data security

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## ✨ Features

### 📊 Dashboard
- Real-time financial overview
- Monthly income vs expenses chart
- Category breakdown pie chart
- Daily spending heatmap
- Quick transaction entry
- Account balance summary

### 💰 Transaction Management
- Add, edit, delete transactions
- Multi-currency support
- Category assignment
- Account selection
- Date filtering
- Search functionality
- Bulk operations

### 🏦 Account Management
- Multiple account types (Cash, Bank, Credit, E-wallet)
- Multi-currency accounts
- Balance tracking
- Account-specific transactions
- Transfer between accounts

### 📈 Budget Tracking
- Monthly budget limits by category
- Real-time spending vs budget comparison
- Budget alerts and notifications
- Historical budget performance
- Visual progress indicators

### 🎯 Goal Management
- Financial goal creation
- Progress tracking
- Target date management
- Achievement notifications
- Goal categories

### 📋 Reports & Analytics
- Comprehensive financial reports
- CSV export functionality
- Date range filtering
- Category-wise analysis
- Monthly/yearly summaries
- Printable reports

### ⚙️ Settings
- Base currency configuration
- Exchange rate management
- Custom currency addition
- Theme customization (Dark/Light)
- Data backup/restore

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Setup Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd expense-tracker-mui-d3
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
Run the SQL schema in your Supabase dashboard (see `database/schema.sql`)

5. **Start Development Server**
```bash
npm run dev
```

6. **Access Application**
Open http://localhost:3000

## 📖 Usage Guide

### First Time Setup
1. **Sign Up/Login**: Create account or login with existing credentials
2. **Set Base Currency**: Configure your primary currency in Settings
3. **Create Accounts**: Add your financial accounts (bank, cash, etc.)
4. **Add Categories**: Create income/expense categories
5. **Set Budgets**: Define monthly spending limits
6. **Create Goals**: Set financial targets

### Daily Usage
1. **Add Transactions**: Record income/expenses as they occur
2. **Check Dashboard**: Monitor spending patterns and budget status
3. **Review Budgets**: Track monthly spending vs limits
4. **Update Goals**: Record progress toward financial targets
5. **Generate Reports**: Export data for analysis

### Advanced Features
- **Multi-currency**: Add transactions in different currencies
- **Transfers**: Move money between accounts
- **Bulk Import**: Import transactions via CSV
- **Data Export**: Export filtered transaction data
- **Custom Categories**: Create personalized expense categories

## 🏗 Application Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── accounts/          # Account management
│   ├── budgets/           # Budget tracking
│   ├── goals/             # Goal management
│   ├── reports/           # Reports and analytics
│   ├── settings/          # Application settings
│   └── transactions/      # Transaction management
├── components/            # Reusable UI components
│   ├── charts/           # D3.js chart components
│   ├── forms/            # Form components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client and types
│   ├── currency.ts       # Currency utilities
│   ├── store.ts          # Zustand state management
│   └── types.ts          # TypeScript type definitions
└── styles/               # Global styles
```

### Component Hierarchy
```
App Layout
├── Header (Navigation, Theme Toggle, User Menu)
├── Sidebar (Navigation Menu)
└── Main Content
    ├── Dashboard (Charts, Quick Actions)
    ├── Transaction Pages (CRUD Operations)
    ├── Account Management
    ├── Budget Tracking
    ├── Goal Management
    ├── Reports & Analytics
    └── Settings
```

## 🔄 Data Flow

### State Management Flow
```
User Action → Zustand Store → Supabase API → Database
                    ↓
            UI Component Update
```

### Authentication Flow
```
Login/Signup → Supabase Auth → Set User Session → Load User Data
```

### Transaction Flow
```
Add Transaction → Validate Data → Convert Currency → Update Account Balance → Sync to Database
```

### Budget Tracking Flow
```
Set Budget → Track Expenses → Calculate Remaining → Alert if Exceeded → Generate Reports
```

## ⚙️ Configuration

### Currency Configuration
```typescript
// src/lib/currency.ts
export const SUPPORTED_CURRENCIES = {
  THB: { symbol: '฿', name: 'Thai Baht' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  JPY: { symbol: '¥', name: 'Japanese Yen' }
};
```

### Theme Configuration
```typescript
// src/app/layout.tsx
const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: { main: '#1976d2' },
    success: { main: '#2e7d32' },
    error: { main: '#c62828' }
  }
});
```

### Database Configuration
- **RLS Policies**: Ensure users can only access their own data
- **Indexes**: Optimize query performance
- **Triggers**: Automatic timestamp updates

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style
- **ESLint**: Enforces code quality rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking enabled
- **Conventional Commits**: Standardized commit messages

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] SSL certificates configured
- [ ] Performance monitoring setup
- [ ] Error tracking configured

## 🔍 Troubleshooting

### Common Issues

**Authentication Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure email confirmation

**Data Not Loading**
- Check network connectivity
- Verify database permissions
- Review browser console errors

**Currency Conversion Issues**
- Update exchange rates
- Verify currency codes
- Check API rate limits

**Performance Issues**
- Enable database indexes
- Optimize query patterns
- Implement pagination

### Debug Mode
```bash
DEBUG=true npm run dev
```

### Logs
- Browser DevTools Console
- Supabase Dashboard Logs
- Vercel Function Logs

## 📞 Support

For technical issues or questions:
1. Check troubleshooting section
2. Review GitHub issues
3. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Node.js**: 18+  
**License**: Private/Proprietary