# 💰 Student Finance Manager - MVC Structure

## 📁 **FOLDER STRUCTURE:**

```
site1/
├── index.html                      # Landing page (ONLY file at root)
│
├── views/                          # All HTML views
│   ├── auth/
│   │   ├── login.html             # Login page
│   │   └── register.html          # Registration page
│   ├── workflow/
│   │   ├── goals.html             # Step 1: Set Goals
│   │   ├── budget.html            # Step 2: Create Budget
│   │   └── expenditure.html       # Step 3: Track Expenses
│   ├── dashboard/
│   │   └── dashboard.html         # Dashboard with statistics
│   ├── profile/
│   │   └── profile.html           # User profile
│   ├── reports/
│   │   └── reports.html           # Financial reports
│   ├── settings/
│   │   └── settings.html          # App settings
│   ├── sms/
│   │   └── sms-parser.html        # SMS expense parser
│   └── pages/
│       ├── about.html             # About page
│       ├── faq.html               # FAQ
│       └── privacy.html           # Privacy policy
│
├── controllers/                    # JavaScript logic (Controllers)
│   ├── auth.js                    # Authentication logic
│   ├── goals.js                   # Goals management
│   ├── budget.js                  # Budget management
│   ├── expenditure.js             # Expense tracking
│   └── dashboard.js               # Dashboard logic
│
├── models/                         # Data models (Future use)
│
├── includes/                       # Reusable components
│   └── (header, footer, sidebar - future)
│
└── public/                         # Public assets
    └── assets/
        ├── css/
        │   ├── style.css          # Main styles
        │   └── enhanced.css       # Enhanced UI
        ├── js/
        │   ├── config.js          # Configuration
        │   ├── main.js            # Core utilities
        │   └── app-utils.js       # Reusable utilities
        └── images/
            └── (future images)
```

---

## 🚀 **QUICK START:**

### **1. Access the Application:**
```
Landing Page: http://localhost/site1/index.html
Login Page:   http://localhost/site1/views/auth/login.html
```

### **2. Login Credentials:**
```
Email: test@student.com
Password: test123
```

### **3. Workflow:**
```
Login → Goals → Budget → Expenditure → Dashboard
```

---

## 🎯 **MVC ARCHITECTURE:**

### **Model (Data Layer):**
- Uses browser localStorage
- Data stored in JSON format
- Keys: `financial_goals`, `financial_budgets`, `financial_expenditures`

### **View (Presentation Layer):**
- All HTML files in `views/` folder
- Organized by feature/module
- Clean separation from logic

### **Controller (Logic Layer):**
- All JavaScript logic in `controllers/` folder
- Handles user interactions
- Manages data flow between Model and View

---

## 📋 **FEATURES:**

- ✅ **Self-Contained** - No external dependencies
- ✅ **Offline-Ready** - Works without internet
- ✅ **Local Authentication** - No backend required
- ✅ **Session Management** - 30-minute timeout
- ✅ **Data Persistence** - localStorage + cookies
- ✅ **Responsive Design** - Mobile-friendly
- ✅ **Clean MVC Structure** - Easy to maintain

---

## 🔧 **TECHNICAL STACK:**

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Architecture:** MVC-like pattern
- **Storage:** localStorage, sessionStorage, Cookies
- **Icons:** Font Awesome
- **Server:** Apache (XAMPP)

---

## 📖 **NAVIGATION:**

The application uses a smart navigation system that maps old page names to new MVC structure:

```javascript
// In public/assets/js/main.js
Nav.go('login.html') → /site1/views/auth/login.html
Nav.go('goals-workflow.html') → /site1/views/workflow/goals.html
```

---

## ✅ **VERIFICATION:**

### **Check Structure:**
```powershell
# Verify folders exist
Get-ChildItem -Directory
# Should show: views, controllers, models, includes, public
```

### **Test Application:**
```
1. Visit: http://localhost/site1/index.html
2. Click "Login"
3. Login with test credentials
4. Navigate through workflow
5. All features should work
```

---

## 🎊 **CLEAN & ORGANIZED:**

- ✅ Only essential files
- ✅ Clear folder structure
- ✅ MVC-like architecture
- ✅ Easy to navigate
- ✅ Professional organization
- ✅ Scalable design

**Made with ❤️ for students**
