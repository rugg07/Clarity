# Clarity

Welcome to the **Clarity** repository. This project is a comprehensive web application designed to provide users with a seamless experience, integrating various modern web technologies and services.
![App Screenshot](https://v0-portflio-swvezkk4ikp.vercel.app/Clarity-base.png)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Environment Variables](#environment-variables)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)

---

## Introduction

Clarity is a web application that leverages the power of Next.js, Clerk for authentication, Prisma for database management, and integrates with various third-party services to enhance functionality. This project aims to deliver a robust and scalable solution for modern web needs.

---

## Features

- **User Authentication**: Secure and seamless user authentication using Clerk.
- **Database Management**: Efficient data handling with Prisma connected to a PostgreSQL database.
- **Third-Party Integrations**: Enhanced capabilities through integration with services like Stripe for payments and Firebase for additional functionalities.
- **Responsive Design**: Optimized for various devices to ensure a consistent user experience.

---

## Technologies Used

- **Next.js**: A React framework for server-side rendering and building static web applications.
- **Clerk**: Provides authentication and user management solutions.
- **Prisma**: An ORM for efficient database interactions.
- **PostgreSQL**: A powerful, open-source relational database system.
- **Stripe**: Payment processing platform.
- **Firebase**: Platform for building web and mobile applications.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TypeScript**: Superset of JavaScript for type-safe programming.

---

## Environment Variables

To run this project, you will need to set up the following environment variables in a `.env` file at the root of your project:

```env
# Database Configuration
DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/sync-user"

# Stripe Configuration
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID="your_firebase_project_id"
NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID="your_firebase_app_id"
NEXT_PUBLIC_FIREBASE_CONFIG_MEASUREMENT_ID="your_firebase_measurement_id"

# Application Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=10000
```

**Note**: Replace placeholder values with your actual configuration details.

---

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rugg07/Clarity.git
   cd Clarity
   ```

2. **Install dependencies**:

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, install the required packages:

   ```bash
   npm install
   ```

3. **Set up the environment variables**:

   Create a `.env` file in the root directory and add the necessary environment variables as specified above.

---

## Usage

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open the application**:

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. Make your changes and commit them:

   ```bash
   git commit -m "Add feature name"
   ```

4. Push to the branch:

   ```bash
   git push origin feature-name
   ```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any questions or suggestions, feel free to contact me through my GitHub profile: [@rugg07](https://github.com/rugg07)

---

Thank you for exploring this project! Your feedback is greatly appreciated. 
