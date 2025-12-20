<!-- Back to Top Navigation Anchor -->

<a name="readme-top"></a>

<!-- Project Shields -->
<div align="center">
  
  [![Contributors][contributors-shield]][contributors-url]
  [![Forks][forks-shield]][forks-url]
  [![Stargazers][stars-shield]][stars-url]
  [![Issues][issues-shield]][issues-url]
  [![MIT License][license-shield]][license-url]
  [![Twitter][twitter-shield]][twitter-url]
</div>

<br />

<div align="center">
  <h1>🔗 Bub It API</h1>
  <p>
    <strong>A powerful URL shortening service with advanced features</strong>
  </p>
  <p>
    Built with ❤️ by <a href="https://www.github.com/moyinoluwa-10">Moyinoluwa Adelowo</a>
  </p>
  <p align="center">
    <a href="https://github.com/moyinoluwa-10/bub-it-api#readme"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://api.bub.icu/">Live API</a>
    ·
    <a href="https://github.com/moyinoluwa-10/bub-it-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/moyinoluwa-10/bub-it-api/issues">Request Feature</a>
  </p>
</div>

---

<!-- About the API -->

## 📖 About The Project

**Bub It API** is a modern, production-ready URL shortening service that helps you create short, memorable links. Built with TypeScript and Express.js, it provides a robust backend for managing URLs with features like user authentication, QR code generation, and comprehensive analytics. The frontend repository can be accessed at [Bub It Frontend](https://github.com/moyinoluwa-10/bub-it). The fronted is also live at [https://www.bub.icu](https://www.bub.icu).

### ✨ Key Features

- **🔐 Authentication & Authorization** - Secure user registration and login with JWT tokens
- **🔗 URL Shortening** - Create custom or auto-generated short URLs
- **📊 Analytics** - Track clicks, locations, and engagement metrics
- **🎨 QR Code Generation** - Automatically generate QR codes for shortened URLs
- **⚡ Redis Caching** - Lightning-fast response times with intelligent caching
- **🛡️ Security** - Rate limiting, input sanitization, and CORS protection
- **📧 Email Notifications** - Email verification and password reset functionality
- **🌍 Custom Domains** - Support for custom redirect domains
- **♻️ Graceful Shutdown** - Proper resource cleanup with retry mechanism
- **📝 Comprehensive Logging** - Winston-based logging with multiple transports

<p align="right"><a href="#readme-top">back to top</a></p>

---

<!-- Built With -->

## 🛠️ Built With

<div align="center">

![TypeScript][typeScript]
![Node.js][node]
![Express.js][express]
![MongoDB][mongodb]
![Redis](https://img.shields.io/badge/Redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Git][git]

</div>

### Core Technologies

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript for better development experience
- **[Node.js](https://nodejs.org/)** - JavaScript runtime built on Chrome's V8 engine
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for flexible data storage
- **[Mongoose](https://mongoosejs.com/)** - Elegant MongoDB object modeling
- **[Redis](https://redis.io/)** - In-memory data store for caching and performance
- **[JWT](https://jwt.io/)** - Secure authentication with JSON Web Tokens

### Key Libraries

- **Security**: Helmet, CORS, HPP, bcryptjs
- **Validation**: Custom validators with Mongoose schemas
- **Logging**: Winston with multiple transports
- **Email**: Nodemailer for transactional emails
- **QR Codes**: qrcode library for visual link sharing
- **Rate Limiting**: express-rate-limit for API protection

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🏗️ Project Architecture

```
src/
├── config/           # Configuration files (database, env, cookies)
├── errors/           # Custom error classes
├── lib/              # Utility libraries (cache, logging)
├── middleware/       # Express middleware (auth, error handling, rate limiting)
├── modules/          # Feature modules (auth, url, user, redirect)
│   ├── auth/         # Authentication logic
│   ├── url/          # URL management
│   ├── user/         # User management
│   └── redirect/     # URL redirection
├── types/            # TypeScript type definitions
└── utils/            # Helper functions (JWT, hashing, email)
```

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/en/download/)
- **MongoDB** - [Installation Guide](https://www.mongodb.com/docs/manual/installation/)
- **Redis** (Optional but recommended) - [Installation Guide](https://redis.io/docs/getting-started/)
- **npm** or **yarn** - Comes with Node.js

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/moyinoluwa-10/bub-it-api.git
   cd bub-it-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp example.env .env
   ```

   Then update the `.env` file with your configurations.



4. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

5. **Build for production**

   ```bash
   npm run build
   npm start
   ```

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint               | Description              | Auth Required |
|--------|------------------------|--------------------------|---------------|
| POST   | `/api/auth/register`   | Register new user        | ❌            |
| POST   | `/api/auth/login`      | Login user               | ❌            |
| POST   | `/api/auth/logout`     | Logout user              | ❌            |
| GET    | `/api/auth/verify-email` | Verify email address   | ❌            |
| POST   | `/api/auth/forgot-password` | Request password reset | ❌       |
| POST   | `/api/auth/reset-password` | Reset password        | ❌            |

### URLs

| Method | Endpoint               | Description              | Auth Required |
|--------|------------------------|--------------------------|---------------|
| POST   | `/api/urls`            | Create short URL         | ✅            |
| GET    | `/api/urls`            | Get user's URLs          | ✅            |
| GET    | `/api/urls/:id`        | Get specific URL         | ✅            |
| PATCH  | `/api/urls/:id`        | Update URL               | ✅            |
| DELETE | `/api/urls/:id`        | Delete URL               | ✅            |
| GET    | `/api/urls/:id/qrcode` | Get URL QR code          | ✅            |

### Users

| Method | Endpoint               | Description              | Auth Required |
|--------|------------------------|--------------------------|---------------|
| GET    | `/api/users/me`        | Get current user         | ✅            |


### Redirect

| Method | Endpoint      | Description              | Auth Required |
|--------|---------------|--------------------------|---------------|
| GET    | `/:shortCode` | Redirect to original URL | ❌            |

### Health Check

| Method | Endpoint   | Description       | Auth Required |
|--------|------------|-------------------|---------------|
| GET    | `/health`  | API health status | ❌            |

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🎯 Usage

### Live Deployment

The API is live and ready to use at: **[https://api.bub.icu](https://api.bub.icu)**

### Example Requests

**Create a short URL:**
```bash
curl -X POST https://api.bub.icu/api/urls \
  -H "Content-Type: application/json" \
  --cookie "accessToken=...; refreshToken=..." \
  -d '{
    "longUrl": "https://www.example.com/very-long-url",
    "customAlias": "mylink"
  }'
```

**Redirect to original URL:**
```bash
curl https://api.bub.icu/mylink
# Redirects to https://www.example.com/very-long-url
```

**Get QR Code:**
```bash
curl https://api.bub.icu/api/urls/:urlId/qrcode \
  --cookie "accessToken=...; refreshToken=..."
```

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🔒 Security Features

- **🛡️ Helmet.js** - Sets security-related HTTP headers
- **🔐 JWT Authentication** - Secure token-based authentication
- **🚦 Rate Limiting** - Prevents abuse and DDoS attacks
- **🧹 Input Sanitization** - MongoDB injection prevention
- **🍪 Secure Cookies** - HTTP-only, signed cookies
- **🌐 CORS Protection** - Configurable cross-origin resource sharing
- **🔑 Password Hashing** - bcryptjs for secure password storage
- **📧 Email Verification** - Ensures valid user accounts

<p align="right"><a href="#readme-top">back to top</a></p>

---

## ⚡ Performance Optimizations

- **Redis Caching** - Reduces database queries and improves response times
- **Connection Pooling** - Efficient database connection management
- **Compression** - Gzip compression for reduced payload sizes
- **Graceful Shutdown** - Proper cleanup of resources with retry mechanism
- **Background Jobs** - Non-blocking operations for email sending
- **Index Optimization** - MongoDB indexes for faster queries

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 📖 Lessons Learned

Building this project has been an incredible learning journey! Here are some key takeaways:

### Technical Skills

- **🧪 Test Driven Development (TDD)** - Writing tests first leads to better code design
- **🔧 Backend Testing** - Using Jest and Supertest for comprehensive API testing
- **💾 In-Memory Testing** - Leveraging mongo-memory-server for isolated tests
- **🐛 Debugging** - Advanced debugging techniques and error handling strategies
- **📝 API Documentation** - Creating clear and comprehensive API documentation
- **🔄 Database Migrations** - Managing schema changes and data consistency
- **⚡ Caching Strategies** - Implementing Redis for performance optimization
- **🛡️ Security Best Practices** - Authentication, authorization, and data protection
- **🏗️ Architecture Design** - Modular, scalable application structure
- **♻️ Resource Management** - Graceful shutdown and proper cleanup

### Soft Skills

- **📊 Project Planning** - Breaking down complex features into manageable tasks
- **🎯 Problem Solving** - Tackling challenges with systematic approaches
- **📚 Continuous Learning** - Staying updated with best practices and new technologies
- **🤝 Code Quality** - Writing clean, maintainable, and well-documented code

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Don't forget to give the project a star! ⭐ Thanks again!

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 🗺️ Roadmap

- [x] User authentication and authorization
- [x] URL shortening with custom aliases
- [x] QR code generation
- [x] Redis caching
- [x] Email notifications
- [x] Graceful shutdown mechanism
<!-- - [ ] Analytics dashboard
- [ ] Link expiration dates
- [ ] API rate limiting per user
- [ ] Webhook support
- [ ] Bulk URL creation
- [ ] Custom branded short domains
- [ ] Link preview generation
- [ ] Integration tests
- [ ] API documentation with Swagger/OpenAPI -->

See the [open issues](https://github.com/moyinoluwa-10/bub-it-api/issues) for a full list of proposed features (and known issues).

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 📄 License

Distributed under the MIT License. See [LICENSE](https://github.com/moyinoluwa-10/bub-it-api/blob/main/LICENSE.md) for more information.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. ✨

<p align="right"><a href="#readme-top">back to top</a></p>

---

## 📧 Contact & Support

Have questions, suggestions, or just want to say hi? Feel free to reach out!

<div align="center">

### Moyinoluwa Adelowo

[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/MoyinAdelowo)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:moyinadelowo@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/moyinoluwa-10)

**Project Link**: [https://github.com/moyinoluwa-10/bub-it-api](https://github.com/moyinoluwa-10/bub-it-api)

**Live Demo**: [https://api.bub.icu](https://api.bub.icu)

</div>

<p align="right"><a href="#readme-top">back to top</a></p>

---

<!-- ## 🙏 Acknowledgments

Special thanks to all the amazing open-source projects and resources that made this possible:

* [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
* [MongoDB](https://www.mongodb.com/) - Flexible NoSQL database
* [Redis](https://redis.io/) - In-memory data store
* [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
* [Node.js](https://nodejs.org/) - JavaScript runtime
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) - README inspiration
* [Shields.io](https://shields.io/) - Badges for documentation

And to everyone who has contributed, starred, or used this project - **thank you!** 💙

<p align="right"><a href="#readme-top">back to top</a></p>

--- -->

<div align="center">

### ⭐ Star this repository if you found it helpful!

Made with ❤️ by [Moyinoluwa Adelowo](https://github.com/moyinoluwa-10)

</div>

---

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/moyinoluwa-10/bub-it-api.svg?style=for-the-badge
[contributors-url]: https://github.com/moyinoluwa-10/bub-it-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/moyinoluwa-10/bub-it-api.svg?style=for-the-badge
[forks-url]: https://github.com/moyinoluwa-10/bub-it-api/network/members
[stars-shield]: https://img.shields.io/github/stars/moyinoluwa-10/bub-it-api.svg?style=for-the-badge
[stars-url]: https://github.com/moyinoluwa-10/bub-it-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/moyinoluwa-10/bub-it-api.svg?style=for-the-badge
[issues-url]: https://github.com/moyinoluwa-10/bub-it-api/issues
[license-shield]: https://img.shields.io/github/license/moyinoluwa-10/bub-it-api.svg?style=for-the-badge
[license-url]: https://github.com/moyinoluwa-10/bub-it-api/blob/main/LICENSE.md
[twitter-shield]: https://img.shields.io/badge/-@MoyinAdelowo-1ca0f1?style=for-the-badge&logo=twitter&logoColor=white&link=https://twitter.com/MoyinAdelowo
[twitter-url]: https://twitter.com/MoyinAdelowo
[javascript]: https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1C
[typeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[node]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[express]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[mongodb]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[git]: https://img.shields.io/badge/Git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white