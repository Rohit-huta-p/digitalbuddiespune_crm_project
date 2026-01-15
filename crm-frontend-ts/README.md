# CRM Frontend (TypeScript)

A modern Customer Relationship Management (CRM) frontend application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- Modern, responsive UI with dark/light theme support
- Built with Next.js 14 and React 18
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI components for accessible UI elements
- Form handling with React Hook Form and Zod validation
- Authentication system
- Data visualization with Recharts
- Calendar functionality with Schedule-X

## 📁 Project Structure

```
crm-frontend-ts/
├── public/                 # Static files
├── src/
│   ├── app/                # Next.js 14+ App Router
│   │   ├── (app)/           # Main application routes (protected)
│   │   ├── api/            # API routes
│   │   ├── login/           # Authentication pages
│   │   └── layout.tsx       # Root layout
│   │
│   ├── components/        # Reusable UI components
│   │   ├── alpha/           # Experimental components
│   │   ├── billing/         # Billing related components
│   │   ├── calendar/        # Calendar components
│   │   ├── charts/          # Data visualization components
│   │   ├── chats/           # Chat interface components
│   │   ├── employees/       # Employee management components
│   │   ├── layout/          # Layout components
│   │   ├── providers/       # Context providers
│   │   ├── tasks/           # Task management components
│   │   └── ui/              # Base UI components (shadcn/ui)
│   │
│   ├── context/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and configurations
│   └── types/               # TypeScript type definitions
│
├── .eslintrc.json         # ESLint configuration
├── .gitignore
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd crm-frontend-ts
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add your environment variables:

   ```
   NEXT_PUBLIC_API_URL=your_api_url_here
   # Add other environment variables as needed
   ```

4. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses:

- Tailwind CSS for utility-first styling
- CSS Variables for theming
- Class Variance Authority for component variants
- Tailwind Merge for conditional class names

## 📚 Technologies Used

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Context
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: Axios
- **Icons**: Lucide Icons, Tabler Icons
- **Date Handling**: date-fns, dayjs
- **Data Visualization**: Recharts
- **Calendar**: Schedule-X

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
