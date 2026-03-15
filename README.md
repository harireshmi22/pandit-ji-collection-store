# 🛍️ Pandit Ji Collection Store

A modern, full-featured e-commerce platform built with Next.js, MongoDB, and Redis. This project showcases a complete product management system with advanced features like caching, real-time updates, and a responsive admin dashboard.

## ✨ Key Features

### 🛒 E-commerce Functionality
- **Product Management**: Full CRUD operations for products with validation
- **Advanced Search & Filtering**: Search by name, description, brand; filter by category, colors, sizes, materials
- **Smart Sorting**: Sort by price, rating, popularity, name, and newest arrivals
- **Product Variants**: Support for multiple sizes, colors, and materials
- **Inventory Management**: Stock tracking and management
- **Featured Products**: Highlight special products and new arrivals

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Components**: Built with React, Framer Motion animations
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Real-time Updates**: Live data synchronization
- **Loading States**: Smooth user experience with proper loading indicators

### 🚀 Performance & Scalability
- **Multi-layer Caching**: Redis + in-memory caching for blazing fast responses
- **Database Optimization**: MongoDB with optimized queries and indexing
- **API Optimization**: RESTful APIs with proper error handling
- **Image Management**: Cloudinary integration for image uploads
- **Background Jobs**: BullMQ for processing background tasks

### 🔐 Security & Authentication
- **NextAuth.js**: Secure authentication system
- **Role-based Access**: Admin and user role management
- **API Security**: Protected routes and data validation
- **Environment Variables**: Secure configuration management

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Swiper** - Carousel/slider component

### Backend
- **Node.js** - Runtime environment
- **MongoDB** - NoSQL database with Mongoose ODM
- **Redis** - In-memory data store for caching
- **NextAuth.js** - Authentication solution
- **BullMQ** - Queue system for background jobs

### Development & Deployment
- **Docker** - Containerization
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Cloudinary** - Cloud image management

## 📁 Project Structure

```
pandit-ji-collection-store-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard routes
│   │   │   ├── products/      # Product management
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── orders/        # Order management
│   │   │   └── users/         # User management
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product CRUD APIs
│   │   │   ├── admin/         # Admin APIs
│   │   │   └── auth/          # Authentication APIs
│   │   └── (shop)/            # Shop pages
│   ├── components/            # Reusable components
│   ├── context/              # React context providers
│   ├── lib/                  # Utility functions
│   ├── models/               # Database models
│   ├── scripts/              # Helper scripts
│   └── service/              # External service integrations
├── public/                   # Static assets
├── docs/                     # Documentation
└── docker-compose.yml        # Docker configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Redis (optional, for caching)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harireshmi22/pandit-ji-collection-store.git
   cd pandit-ji-collection-store-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/pandit-ji-store
   REDIS_URL=redis://localhost:6379
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Run Database Setup**
   ```bash
   npm run db:indexes
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Admin Dashboard

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login with admin credentials

2. **Product Management**
   - **View Products**: See all products with search and filtering
   - **Add Product**: Click "Add Product" button
   - **Edit Product**: Click on any product to edit
   - **Delete Product**: Use the delete button with confirmation

3. **Analytics**
   - View sales statistics
   - Monitor product performance
   - Track user activity

### Shopping Experience

1. **Browse Products**
   - Use search bar to find products
   - Apply filters for category, brand, price
   - Sort products by various criteria

2. **Product Details**
   - View comprehensive product information
   - Check available sizes and colors
   - Read reviews and ratings

3. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Proceed to checkout

## 🔧 API Reference

### Products API

#### GET /api/products
Fetch products with optional filtering and pagination.

**Query Parameters:**
- `search` - Search term for name, description, brand
- `category` - Filter by category
- `brand` - Filter by brand  
- `colors` - Filter by colors (comma-separated)
- `sizes` - Filter by sizes (comma-separated)
- `materials` - Filter by materials (comma-separated)
- `featured` - Filter featured products (true/false)
- `isNewArrival` - Filter new arrivals (true/false)
- `sort` - Sort order (price_asc, price_desc, rating, popular, name)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "source": "database",
  "cache": {
    "hit": false,
    "layer": "none"
  }
}
```

#### POST /api/products
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Clothing",
  "brand": "Brand Name",
  "image": "/images/product.jpg",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Black", "White"],
  "materials": ["Cotton"],
  "stock": 100,
  "featured": false,
  "isNewArrival": true
}
```

#### GET /api/products/[id]
Get a single product by ID.

#### PUT /api/products/[id]
Update a product by ID.

#### DELETE /api/products/[id]
Delete a product by ID.

## 🎯 Key Features Explained

### Caching System
The application implements a sophisticated multi-layer caching strategy:

1. **Redis Cache** - Primary cache layer for distributed environments
2. **In-Memory Cache** - Fallback cache for single-instance deployments
3. **Cache Invalidation** - Automatic cache clearing on data updates
4. **TTL Management** - Configurable cache expiration times

### Performance Optimizations
- **Parallel Database Queries** - Execute count and data queries simultaneously
- **Database Indexing** - Optimized indexes for common query patterns
- **Lazy Loading** - Load components and data only when needed
- **Image Optimization** - Automatic image resizing and optimization

### Security Features
- **Input Validation** - Comprehensive validation for all user inputs
- **SQL Injection Prevention** - Parameterized queries and sanitization
- **XSS Protection** - Content Security Policy and input sanitization
- **Rate Limiting** - API rate limiting to prevent abuse

## 🐳 Docker Support

### Development with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production image
docker build -t pandit-ji-collection .

# Run production container
docker run -p 3000:3000 pandit-ji-collection
```

## 📊 Monitoring & Analytics

### Available Metrics
- **Product Performance** - Views, conversions, ratings
- **Sales Analytics** - Revenue, order count, average order value
- **User Behavior** - Session duration, page views, bounce rate
- **System Performance** - Response times, cache hit rates, error rates

### Admin Dashboard Features
- **Real-time Statistics** - Live data updates
- **Visual Charts** - Interactive data visualization
- **Export Reports** - Download analytics data
- **Custom Date Ranges** - Flexible time period filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Database
npm run db:indexes      # Create database indexes

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container

# Performance
npm run setup:perf      # Setup performance optimizations
npm run test:redis      # Test Redis connection
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`
   - Verify network connectivity

2. **Redis Cache Issues**
   - Redis is optional - app works without it
   - Check Redis server status
   - Verify Redis URL configuration

3. **Image Upload Problems**
   - Verify Cloudinary credentials
   - Check image size limits
   - Ensure proper file formats

4. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL configuration
   - Clear browser cookies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by e-commerce best practices
- Community-driven development

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the code comments for detailed explanations

---

**Happy Coding! 🚀**

*Built with ❤️ using Next.js, MongoDB, and modern web technologies*
