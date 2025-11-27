# EventPulse 🎉

> A modern digital command center for school events - built for BTUI'25 Web Development Competition

EventPulse is a comprehensive event management platform designed specifically for schools. It helps students, teachers, and administrators discover, register for, and manage school events seamlessly. With real-time updates, QR code-based attendance tracking, and an intuitive interface, EventPulse makes event management effortless.

## 🌟 Live Demo

**Live Site:** [https://eventpulse.duckdns.org/]  
**GitHub Repository:** [Your GitHub URL Here]

## 📸 Screenshots

[mobile](image.png)
[desktop](image-1.png)

## 🔐 Admin Account

**Email:** admin@gmail.com  
**Password:** Admin123#


## ✨ Features

### For Students
- **Event Discovery**: Browse upcoming events by category, date, or popularity
- **Easy Registration**: Register for events with just a few clicks
- **QR Code Tickets**: Get unique QR codes for registered events
- **Real-time Updates**: Receive live updates during ongoing events
- **Personal Dashboard**: Track registered events and attendance history
- **Notifications**: Get email and in-app notifications for event reminders

### For Teachers/Organizers
- **Event Creation**: Create and manage events with rich details
- **Attendance Tracking**: Scan QR codes to mark attendance
- **Live Updates**: Post real-time updates during events
- **Analytics Dashboard**: View registration stats and attendance data
- **Capacity Management**: Set and monitor event capacity limits

### For Administrators
- **User Management**: Manage students, teachers, and other users
- **Event Moderation**: Approve, feature, or cancel events
- **Analytics**: Comprehensive analytics on events and user engagement
- **System Monitoring**: Health checks and performance monitoring

### Technical Features
- **Real-time Communication**: Socket.IO for live updates
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **QR Code System**: Unique QR codes for users and event tickets
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Email Notifications**: Automated emails for registrations and reminders
- **Image Upload**: Support for event images with Sharp image processing
- **Rate Limiting**: Protection against brute force attacks
- **Data Validation**: Comprehensive input validation and sanitization

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Smooth animations
- **React Toastify** - Toast notifications
- **Chart.js** - Data visualization
- **QRCode.react** - QR code generation
- **jsQR** - QR code scanning
- **date-fns** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **Sharp** - Image processing
- **node-cron** - Scheduled tasks
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### DevOps & Deployment
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **MongoDB Atlas** - Cloud database
- **VPS Hosting** - Self-hosted deployment

## 📁 Project Structure

```
eventpulse/
├── backend/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   └── email.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Notification.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── analytics.js
│   │   ├── notifications.js
│   │   └── attendance.js
│   ├── services/        # Business logic
│   │   ├── emailService.js
│   │   ├── socketService.js
│   │   ├── qrService.js
│   │   ├── cronService.js
│   │   └── notificationService.js
│   ├── utils/           # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── uploads/         # Uploaded files
│   ├── .env             # Environment variables
│   ├── package.json
│   └── server.js        # Entry point
│
└── public/
    ├── src/
    │   ├── components/   # React components
    │   │   ├── Auth/
    │   │   ├── Events/
    │   │   ├── Layout/
    │   │   ├── Loading/
    │   │   └── Navigation/
    │   ├── context/      # React Context
    │   │   ├── AuthContext.js
    │   │   └── SocketContext.js
    │   ├── pages/        # Page components
    │   │   ├── HomePage.js
    │   │   ├── EventsPage.js
    │   │   ├── EventDetailPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── AdminPanel.js
    │   │   └── Auth/
    │   ├── services/     # API services
    │   │   └── api.js
    │   ├── styles/       # CSS files
    │   ├── utils/        # Utility functions
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    └── .env
```


## 🎯 Key Functionalities

### Event Management
- Create events with detailed information (title, description, category, dates, location, capacity)
- Upload event images
- Set registration deadlines
- Mark events as featured
- Cancel or complete events
- Add live updates during events

### Registration System
- Students can register for events
- Automatic capacity checking
- QR code generation for each registration
- Email confirmation with QR code
- Registration deadline enforcement

### Attendance Tracking
- QR code scanner for marking attendance
- Real-time attendance updates
- Attendance history for students
- Export attendance reports

### Notifications
- Email notifications for:
  - Event registration confirmation
  - Event reminders (24 hours before)
  - Event cancellations
  - Live updates
- In-app notifications
- Customizable notification preferences

### Analytics
- Event statistics (views, registrations, attendance)
- User engagement metrics
- Category-wise event distribution
- Attendance trends
- Popular events

## 🔒 Security Features

- **Authentication**: JWT-based authentication with secure token storage
- **Password Security**: Bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using express-validator
- **XSS Protection**: Helmet.js for security headers
- **CORS**: Configured CORS for API security
- **SQL Injection Prevention**: MongoDB's built-in protection
- **File Upload Security**: File type and size validation

## 📱 Responsive Design

EventPulse is fully responsive and works seamlessly across:
- Desktop computers (1920px and above)
- Laptops (1024px - 1919px)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🎨 Design Highlights

- **Modern UI**: Clean and intuitive interface
- **Smooth Animations**: Framer Motion for page transitions
- **Color Scheme**: Professional blue and white theme
- **Typography**: Clear and readable fonts
- **Icons**: Consistent icon usage throughout
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful messages when no data is available

## 🧪 Testing

The application has been tested for:
- User registration and login
- Event creation and management
- Event registration and cancellation
- QR code generation and scanning
- Real-time updates
- Email notifications
- Responsive design across devices
- API endpoint functionality
- Error handling

## 🤝 Contributing

This project was created for the BTUI'25 Web Development Competition. While it's a competition entry, suggestions and feedback are welcome!

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sadaka**

- GitHub: https://github.com/pyrostack23
- Email: sadakaparamiwijerathna1@gmail.com

## 🙏 Acknowledgments

- BTUI'25 for organizing this competition
- All the open-source libraries and tools used in this project
- The amazing developer community for inspiration and resources

## 📞 Support

If you have any questions or need help with the project:

1. Whatsapp : +94 72 082 9190
2. Call : +94 72 082 9190

---

**Built with ❤️ for BTUI'25 Web Development Competition**
