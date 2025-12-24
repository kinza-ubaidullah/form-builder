# Form Builder Application

A comprehensive drag-and-drop form builder designed for small business SaaS products, enabling users to create, customize, and manage forms with advanced features.

## Features

### Core Features
- **Drag-and-Drop Interface**: Visual form editor with intuitive drag-and-drop functionality
- **Multiple Field Types**: Text, email, number, textarea, dropdown, checkbox, radio, date, and file upload
- **Conditional Logic**: Show/hide fields based on user responses
- **Form Templates**: Pre-built templates for common use cases
- **Real-time Preview**: See your form as you build it

### Data Management
- **Submissions Dashboard**: View and manage all form submissions
- **CSV Export**: Export submissions with one click
- **Form Analytics**: Track submission statistics

### Business Features
- **Multi-User Access**: Team collaboration with role-based permissions (admin, editor, viewer)
- **Branding Customization**: Custom colors and styling
- **Form Embedding**: Generate embed codes for websites (iframe and JavaScript)
- **Shareable Links**: Public form URLs for easy sharing
- **Form Status Management**: Draft, published, and archived states

### User Management
- **Authentication**: Secure username/password authentication
- **Admin Panel**: Manage users and roles
- **Team Management**: Create and manage teams

## Design

- **Color Scheme**: Clean blue (#4A90E2) primary color with neutral gray (#F5F7FA) background
- **Layout**: Card-based design with clear visual hierarchy
- **Responsive**: Desktop-first with mobile adaptation
- **Visual Details**: 8px rounded corners, subtle shadows, smooth transitions

## Project Info

Built with modern web technologies for optimal performance and user experience.

## Project Directory

```
├── README.md # Documentation
├── components.json # Component library configuration
├── index.html # Entry file
├── package.json # Package management
├── postcss.config.js # PostCSS configuration
├── public # Static resources directory
│   ├── favicon.png # Icon
│   └── images # Image resources
├── src # Source code directory
│   ├── App.tsx # Entry file
│   ├── components # Components directory
│   ├── context # Context directory
│   ├── db # Database configuration directory
│   ├── hooks # Common hooks directory
│   ├── index.css # Global styles
│   ├── layout # Layout directory
│   ├── lib # Utility library directory
│   ├── main.tsx # Entry file
│   ├── routes.tsx # Routing configuration
│   ├── pages # Pages directory
│   ├── services # Database interaction directory
│   ├── types # Type definitions directory
├── tsconfig.app.json # TypeScript frontend configuration file
├── tsconfig.json # TypeScript configuration file
├── tsconfig.node.json # TypeScript Node.js configuration file
└── vite.config.ts # Vite configuration file
```

## Tech Stack

Vite, TypeScript, React, Supabase, shadcn/ui, Tailwind CSS

## Getting Started

### First Time Setup

1. **Create an account**: Sign up with a username and password
2. **First user becomes admin**: The first registered user automatically gets admin privileges
3. **Create your first form**: Click "Create Form" to start building
4. **Add fields**: Drag and drop fields from the left panel
5. **Configure fields**: Click on a field to edit its properties
6. **Publish**: Change status to "Published" to make the form accessible
7. **Share**: Use the embed code or share the public link

### User Roles

- **Admin**: Full access to all features, can manage users and roles
- **User**: Can create and manage their own forms and teams

### Form Workflow

1. **Create**: Build your form with drag-and-drop
2. **Configure**: Set up field validation, conditional logic, and settings
3. **Publish**: Make the form live
4. **Share**: Embed on your website or share the link
5. **Collect**: Receive submissions
6. **Analyze**: View submissions and export to CSV

## Development Guidelines

### How to edit code locally?

You can choose [VSCode](https://code.visualstudio.com/Download) or any IDE you prefer. The only requirement is to have Node.js and npm installed.

### Environment Requirements

```
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### Installing Node.js on Windows

```
# Step 1: Visit the Node.js official website: https://nodejs.org/, click download. The website will automatically suggest a suitable version (32-bit or 64-bit) for your system.
# Step 2: Run the installer: Double-click the downloaded installer to run it.
# Step 3: Complete the installation: Follow the installation wizard to complete the process.
# Step 4: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### Installing Node.js on macOS

```
# Step 1: Using Homebrew (Recommended method): Open Terminal. Type the command `brew install node` and press Enter. If Homebrew is not installed, you need to install it first by running the following command in Terminal:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Alternatively, use the official installer: Visit the Node.js official website. Download the macOS .pkg installer. Open the downloaded .pkg file and follow the prompts to complete the installation.
# Step 2: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### After installation, follow these steps:

```
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run the command to start the development server: npm run dev -- --host 127.0.0.1
# Step 6: if step 5 failed, try this command to start the development server: npx vite --host 127.0.0.1
```

### How to develop backend services?

Configure environment variables and install relevant dependencies.If you need to use a database, please use the official version of Supabase.

## Learn More

You can also check the help documentation: Download and Building the app（ [https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en](https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en)）to learn more detailed content.
