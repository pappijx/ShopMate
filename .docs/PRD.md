# 🧾 Product Requirements Document (PRD)

### Product: ShopMate – Smart Inventory & Order Management System

### Version: 1.0 (MVP)

### Author: Product Management

### Date: Oct 2025

---

## 1. 🎯 Product Overview

**ShopMate** is a mobile-first web application that enables **small business owners and shopkeepers** to easily manage their inventory, track available stock, and handle incoming customer orders — all from one simple dashboard.

The platform provides:

- A lightweight, flexible **inventory management system**.
- **User registration and authentication** via username, email, phone, and password.
- Ability to **create a company**, add categories, items, and monitor orders.
- A clear, intuitive **mobile-first dashboard** view for shop owners.

The initial release will focus solely on the **seller (shop owner)** experience.

---

## 2. 🧩 Goals & Objectives

| Goal                              | Description                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------- |
| 🧾 Simplify Inventory Management  | Allow any shop owner to add and manage their products and stock quickly.        |
| ⚙️ Enable Flexible Business Setup | System should support any business type (grocery, pharmacy, electronics, etc.). |
| 📱 Mobile-First Experience        | Prioritize small-screen usability and fast navigation.                          |
| 🔒 Cost-Effective Auth            | Use username + password (JWT) to avoid SMS/OTP costs.                           |
| 🚀 Foundation for Growth          | Prepare architecture to easily support customer ordering flow in future phases. |

---

## 3. 🧍 User Personas

### **1️⃣ Shop Owner (Primary User)**

- Owns or manages a small local store.
- Needs to digitize their catalog and keep track of product stock.
- May have limited technical experience.
- Uses a smartphone or simple desktop browser.

**Goals**

- Easily manage categories, items, and stock.
- Quickly see low-stock products.
- Manage and review orders (future phase).

**Pain Points**

- Manually tracking items in notebooks.
- Losing track of stock availability.
- Difficulty in managing customer requests.

---

## 4. 🔧 Functional Requirements

### **A. Authentication & User Management**

| Feature  | Description                                               | Priority  |
| -------- | --------------------------------------------------------- | --------- |
| Signup   | User registers with username, email, phone, and password. | ✅ High   |
| Login    | Authenticate via username/email/phone and password.       | ✅ High   |
| JWT Auth | Backend issues JWT for session handling.                  | ✅ High   |
| Profile  | Display basic user profile and company info.              | ✅ Medium |

---

### **B. Company Setup**

| Feature        | Description                                  | Priority  |
| -------------- | -------------------------------------------- | --------- |
| Create Company | User creates company profile after signup.   | ✅ High   |
| Company Fields | Name, type, address, and owner link.         | ✅ High   |
| Multi-tenancy  | Each user’s data scoped to their company ID. | ✅ High   |
| Edit Company   | Allow updating company details.              | ✅ Medium |

---

### **C. Categories Management**

| Feature              | Description                               | Priority  |
| -------------------- | ----------------------------------------- | --------- |
| Add Category         | Create new category under company.        | ✅ High   |
| Edit/Delete Category | Update or remove categories.              | ✅ Medium |
| View Categories      | Display all categories in dashboard view. | ✅ High   |

---

### **D. Items Management**

| Feature           | Description                                              | Priority  |
| ----------------- | -------------------------------------------------------- | --------- |
| Add Item          | Add item with name, description, price, and stock count. | ✅ High   |
| Edit/Delete Item  | Modify or remove an item.                                | ✅ High   |
| Link to Category  | Each item belongs to a category.                         | ✅ High   |
| List View         | Display items grouped by category.                       | ✅ High   |
| Auto Availability | Mark unavailable when stock = 0.                         | ✅ Medium |

---

### **E. Dashboard**

| Feature           | Description                                          | Priority |
| ----------------- | ---------------------------------------------------- | -------- |
| Summary           | Show key stats (total items, low stock, new orders). | ✅ High  |
| Navigation        | Links to Categories, Items, Orders.                  | ✅ High  |
| Responsive Design | Optimized for mobile-first access.                   | ✅ High  |

---

### **F. Orders (Phase 2)**

| Feature              | Description                                    | Priority  |
| -------------------- | ---------------------------------------------- | --------- |
| View Orders          | Separate “New” and “Old” orders.               | ✅ Medium |
| Update Order Status  | Change order state (`NEW`, `DELIVERED`, etc.). | ✅ Medium |
| Link Order → Company | Orders belong to a specific company.           | ✅ High   |

---

## 5. 🧱 Non-Functional Requirements

| Category            | Requirement                                             |
| ------------------- | ------------------------------------------------------- |
| **Performance**     | App loads under 2s on mobile connections.               |
| **Security**        | Passwords hashed (bcrypt), JWT used for API access.     |
| **Scalability**     | Multi-tenant architecture (company-based data scoping). |
| **Availability**    | 99.9% uptime on production hosting.                     |
| **Accessibility**   | Fully usable on mobile screens (≤ 5.5").                |
| **Cost Efficiency** | Zero recurring auth costs (no SMS).                     |

---

## 6. 🗂️ Data Model (Core Entities)

### **Users**

- `id`, `username`, `email`, `phone`, `password_hash`, `company_id`

### **Companies**

- `id`, `name`, `type`, `address`, `owner_id`

### **Categories**

- `id`, `name`, `company_id`

### **Items**

- `id`, `name`, `description`, `price`, `stock_count`, `category_id`, `company_id`

### **Orders (Phase 2)**

- `id`, `company_id`, `customer_name`, `items (JSON)`, `status`, `created_at`

---

## 7. 🧭 User Flow (MVP)

### **1️⃣ Signup / Login**

- User registers via username, email, phone, and password.
- On success → backend returns JWT → stored client-side.
- Redirect to **Create Company** page.

### **2️⃣ Create Company**

- Enter company name, type, and address.
- On save → backend creates company and links to user.

### **3️⃣ Dashboard**

- Displays:
  - Number of categories
  - Total items
  - Low-stock items
  - Orders summary (placeholder for Phase 2)
- Navigation buttons:  
  → “View Categories” | “View Orders”

### **4️⃣ Category Management**

- Add/edit/delete categories.
- Tapping a category opens **Items List**.

### **5️⃣ Item Management**

- Add/edit/delete items with name, description, price, and stock.
- Items with stock = 0 marked “Out of Stock”.

---

## 8. 🧰 Tech Stack

| Layer                | Technology                                        |
| -------------------- | ------------------------------------------------- |
| **Frontend**         | Next.js (React + TypeScript)                      |
| **UI**               | TailwindCSS + shadcn/ui                           |
| **State Management** | React Query / Zustand                             |
| **Backend**          | Node.js + Express (or NestJS)                     |
| **Database**         | PostgreSQL (via Prisma ORM)                       |
| **Auth**             | JWT (bcrypt hashed passwords)                     |
| **Deployment**       | Vercel (Frontend) + Railway/Render (Backend + DB) |
| **Version Control**  | GitHub                                            |

---

## 9. 🚀 MVP Deliverables

| Milestone                   | Description                           | ETA    |
| --------------------------- | ------------------------------------- | ------ |
| **1. Auth Module**          | Signup, Login, JWT Token Handling     | Week 1 |
| **2. Company Setup**        | Company creation + linking            | Week 2 |
| **3. Dashboard UI**         | Home summary + navigation             | Week 3 |
| **4. Categories & Items**   | CRUD functionality                    | Week 4 |
| **5. Testing & Deployment** | Integration, QA, and deploy to Vercel | Week 5 |

---

## 10. 🔮 Future Enhancements

| Feature           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Customer Portal   | Customers browse shop catalog and create requirement lists. |
| Orders Module     | Full order lifecycle management.                            |
| Low Stock Alerts  | Automatic notifications for near-empty inventory.           |
| Multi-user Access | Staff-level accounts under same company.                    |
| Product Images    | Upload via file storage (S3/Supabase).                      |
| Analytics         | Sales and stock insights via charts.                        |
| PWA Install       | “Add to Home Screen” mobile experience.                     |

---

## 11. 📈 Success Metrics

| Metric            | Target                                    |
| ----------------- | ----------------------------------------- |
| Onboarding Time   | < 2 minutes to create company             |
| Task Success Rate | 95% of users can add an item successfully |
| App Load Time     | < 2 seconds (on 3G)                       |
| Retention         | 70% of users active after 7 days          |
| Bug/Error Rate    | < 1% API failure rate                     |

---

## 12. 🧩 Risks & Mitigation

| Risk                   | Impact | Mitigation                              |
| ---------------------- | ------ | --------------------------------------- |
| SMS/OTP cost           | High   | Use JWT + password-based login          |
| Low technical literacy | Medium | Simple UI + clear onboarding            |
| Stock errors           | Medium | Future audit logs, undo option          |
| Scaling data           | Low    | Use PostgreSQL relational schema        |
| Offline access         | Low    | Implement caching in future PWA release |

---

## 13. 📋 Acceptance Criteria

✅ User can register and log in using username/email/phone.  
✅ User can create and edit company profile.  
✅ User can add, edit, and delete categories.  
✅ User can add items with name, description, price, and stock count.  
✅ Dashboard displays summary metrics.  
✅ All data scoped to logged-in company.  
✅ JWT auth protects all routes.  
✅ Mobile-first UI tested on 375px width screens.

---

## 14. 📦 Release Plan

| Phase   | Deliverable                               | Notes              |
| ------- | ----------------------------------------- | ------------------ |
| MVP     | Seller-side system (auth, company, items) | Public beta        |
| Phase 2 | Orders + customer portal                  | Internal test      |
| Phase 3 | Analytics + Notifications                 | Monetization-ready |

---

**End of Document**
